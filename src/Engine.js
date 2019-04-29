import HttpsProxyAgent from 'https-proxy-agent';
import { RTMClient } from '@slack/rtm-api';
import * as slack from './slack';
import * as gitlab from './gitlab';

const BOT_NAME = process.env.BOT_NAME || 'mr-bot';

const GITLAB_PROJECTS = getProjectIds(process.env.GITLAB_PROJECTS);

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
    return () => console.log({ message: 'unknown action', event });
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
    this.gitlab = {};
    this.gitlab.mergeRequests = await gitlab.getOpenedMRForProject(
      GITLAB_PROJECTS[0]
    );
    this.gitlab.projects = {};
    for (let mr of this.gitlab.mergeRequests) {
      if (!this.gitlab.projects[mr.project_id]) {
        this.gitlab.projects[mr.project_id] = await gitlab.getProject(
          mr.project_id
        );
      }
    }
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

  async runHandler(event) {
    if (!event.text || !this.isAdressedToMe(event)) {
      return;
    }
    const action = this.getActionFromEvent(event);
    action({
      event,
      mergeRequests: this.gitlab.mergeRequests,
      projects: this.gitlab.projects
    });
  }
}

function getProjectIds(input) {
  return input ? input.split(',').map(id => parseInt(id)) : [];
}
