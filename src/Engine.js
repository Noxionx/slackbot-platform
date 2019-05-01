import HttpsProxyAgent from 'https-proxy-agent';

import SlackManager from './managers/SlackManager';
import GitlabManager from './managers/GitlabManager';
import TemplateManager from './managers/TemplateManager';

export class Engine {
  constructor() {
    const proxy = process.env.PROXY
      ? new HttpsProxyAgent(process.env.PROXY)
      : null;

    this.gitlabManager = new GitlabManager({
      url: process.env.GITLAB_URL,
      token: process.env.GITLAB_TOKEN,
      projects: [{ id: 26 }]
    });

    this.slackManager = new SlackManager({
      token: process.env.SLACK_TOKEN,
      mainChannel: process.env.SLACK_CHANNEL,
      botName: process.env.BOT_NAME || 'mr-bot',
      proxy
    });

    this.templateManager = new TemplateManager();
  }

  async init() {
    await this.gitlabManager.init();
    await this.slackManager.init();
    console.log('Engine started');
  }
}
