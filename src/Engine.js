import HttpsProxyAgent from 'https-proxy-agent';
import { RTMClient } from '@slack/rtm-api';
import * as actions from './actions';

const BOT_NAME = process.env.BOT_NAME || 'mr-bot';

const MAN_RE = /man/i;
const TEST_RE = /test/i;

export class Engine {
  async init() {
    const proxy = new HttpsProxyAgent(process.env.PROXY);
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
    console.log('Engine started');
  }

  async runHandler(event) {
    if (!event.text || !this.isAdressedToMe(event)) {
      return;
    }
    const action = this.getActionFromEvent(event);
    action(event);
  }

  getActionFromEvent(event) {
    if (event.text.match(MAN_RE)) return actions.man;
    if (event.text.match(TEST_RE)) return actions.newMergeRequest;
    return () => console.log('unknown action');
  }

  isAdressedToMe(event) {
    return event.text.indexOf(this.me.id) !== -1;
  }
}
