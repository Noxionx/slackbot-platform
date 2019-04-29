import HttpsProxyAgent from 'https-proxy-agent';
import { RTMClient } from '@slack/rtm-api';
import * as slack from './slack';
import * as gitlab from './gitlab';

import db from './db';

const BOT_NAME = process.env.BOT_NAME || 'mr-bot';

const GITLAB_PROJECTS = getProjectIds();

const MAN_RE = /man/i;
const INFO_RE = /info/i;
const LIST_RE = /list/i;
const SHOW_RE = /show (\d+)/i;
const REVIEW_RE = /review (\d+)/i;

export class Engine {
  getActionFromEvent(event) {
    if (event.text.match(MAN_RE)) return slack.man;
    if (event.text.match(INFO_RE)) return slack.info;
    if (event.text.match(LIST_RE)) return slack.list;
    if (event.text.match(SHOW_RE)) return slack.show;
    if (event.text.match(REVIEW_RE)) return slack.review;
    return () => {
      throw `Unknown action. Use \`@${BOT_NAME} man\` to show help`;
    };
  }

  isAdressedToMe(event) {
    return event.text.indexOf(this.me.id) !== -1;
  }

  async init() {
    await this.initGitlab();
    await this.initSlack();
    console.log('Engine started');
  }

  async initGitlab() {
    this.gitlab = {
      mergeRequests: [],
      projects: {}
    };
    this.refreshGitlab(true);
  }

  async initSlack() {
    const proxy = process.env.PROXY
      ? new HttpsProxyAgent(process.env.PROXY)
      : null;
    // Create Real-Time API client
    this.rtm = new RTMClient(process.env.SLACK_TOKEN, { agent: proxy });
    // Start the RTM client
    await this.rtm.start();
    // Listen on message events
    this.rtm.on('message', event => this.runHandler(event));

    // Fetch all users on slack
    const users = await slack.fetchUsers();
    this.users = [...users].filter(u => !u.deleted);

    this.me = this.users.find(u => u.name === BOT_NAME);
    if (!this.me) {
      throw 'Bot user not found in your workspace';
    }
  }

  async refreshGitlab(init = false) {
    const oldMR = this.gitlab.mergeRequests;
    this.gitlab.mergeRequests = [];

    // Fetch merge requests
    for (let projectId of GITLAB_PROJECTS) {
      const mr = await gitlab.getOpenedMRForProject(projectId);
      this.gitlab.mergeRequests = [...this.gitlab.mergeRequests, ...mr];
    }

    // Fetch projects
    for (let mr of this.gitlab.mergeRequests) {
      if (!this.gitlab.projects[mr.project_id]) {
        this.gitlab.projects[mr.project_id] = await gitlab.getProject(
          mr.project_id
        );
      }
    }

    // Clean old reviews
    const reviews = db.get('reviews').value();
    reviews.forEach(r => {
      if (this.gitlab.projects[r.projectId]) return;
      if (
        this.gitlab.mergeRequests.find(
          mr => mr.iid.toString() == r.iid && mr.project_id == r.projectId
        )
      ) {
        return;
      }
      db.get('reviews')
        .remove(r)
        .write();
    });

    if (!init) {
      const newMRs = this.gitlab.mergeRequests.filter(
        mr => oldMR.findIndex(e => e.id === mr.id) === -1
      );
      // TODO New MR
    }
  }

  async runHandler(event) {
    if (!event.text || !this.isAdressedToMe(event)) {
      return;
    }
    try {
      const action = this.getActionFromEvent(event);
      await action({
        event,
        mergeRequests: this.gitlab.mergeRequests,
        projects: this.gitlab.projects,
        users: this.users
      });
    } catch (e) {
      slack.sendMessage({ text: e, channel: event.channel, user: event.user });
    }
  }
}

function getProjectIds() {
  return process.env.GITLAB_PROJECTS
    ? process.env.GITLAB_PROJECTS.split(',').map(id => parseInt(id))
    : [];
}
