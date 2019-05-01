import HttpsProxyAgent from 'https-proxy-agent';

import SlackManager from './managers/SlackManager';
import GitlabManager from './managers/GitlabManager';
import TemplateManager from './managers/TemplateManager';
import ReviewManager from './managers/ReviewManager';
import DBManager from './managers/DBManager';

/**
 * Main projects declaration (has to be improved !)
 */
const PROJECTS = [
  { id: 26, name: 'Boilerplate' }
  //  { id: 123, name: 'TOTO' },
];

export class Engine {
  constructor() {
    const proxy = process.env.PROXY
      ? new HttpsProxyAgent(process.env.PROXY)
      : null;

    this.gitlabManager = new GitlabManager({
      url: process.env.GITLAB_URL,
      token: process.env.GITLAB_TOKEN,
      projects: PROJECTS
    });

    this.slackManager = new SlackManager({
      token: process.env.SLACK_TOKEN,
      mainChannel: process.env.SLACK_CHANNEL,
      botName: process.env.BOT_NAME || 'mr-bot',
      proxy
    });

    this.templateManager = new TemplateManager();

    this.dbManager = new DBManager();

    this.reviewManager = new ReviewManager({
      gitlabManager: this.gitlabManager,
      slackManager: this.slackManager,
      templateManager: this.templateManager,
      dbManager: this.dbManager
    });
  }

  async init() {
    await this.slackManager.init();
    await this.reviewManager.init();

    await this.connectEvents();

    return 'Engine started';
  }

  async connectEvents() {
    this.slackManager.on('man', ({ event }) =>
      this.slackManager.sendDM(event.user, this.templateManager.man())
    );

    this.slackManager.on('info', ({ event }) =>
      this.slackManager.sendDM(event.user, this.templateManager.info())
    );
  }
}
