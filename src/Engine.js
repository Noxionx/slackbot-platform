import HttpsProxyAgent from 'https-proxy-agent';
import { RTMClient } from '@slack/rtm-api';
import * as actions from './actions';
import * as gitlabApi from './gitlab/api';

const BOT_NAME = process.env.BOT_NAME || 'mr-bot';

const GITLAB_PROJECTS = getProjectIds(process.env.GITLAB_PROJECTS);

const MAN_RE = /man/i;
const TEST_RE = /test/i;
const LIST_RE = /list/i;

export class Engine {
  getActionFromEvent(event) {
    if (event.text.match(MAN_RE)) return actions.man;
    if (event.text.match(TEST_RE)) return actions.newMergeRequest;
    if (event.text.match(LIST_RE)) return actions.list;
    return () => console.log('unknown action');
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
    // Fetch Gitlab Groups
    this.gitlab.mergeRequests = await gitlabApi.getAllOpenedMR();
    console.log(this.gitlab.mergeRequests);
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
    const tmp = await actions.fetchUsers();
    this.users = [...tmp].filter(u => !u.deleted);

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
    action(event, this.gitlab.mergeRequests);
  }
}

function getProjectIds(input) {
  return input ? input.split(',').map(id => parseInt(id)) : [];
}
