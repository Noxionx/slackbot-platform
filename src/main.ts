import 'dotenv/config';
import MRBot from './bots/MrBot/MRBot';

const mrBot = new MRBot({
  gitlab: {
    token: process.env.GITLAB_TOKEN,
    url: process.env.GITLAB_URL,
    gitlabProjects: [{ id: 35, name: 'mr-bot' }],
  },
  slack: {
    botName: process.env.SLACK_BOT_NAME,
    botToken: process.env.SLACK_BOT_TOKEN,
    channel: process.env.SLACK_CHANNEL,
  },
  cronSchedule: process.env.MR_BOT_CRON_SCHEDULE,
});

mrBot.start();
