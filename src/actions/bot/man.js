import HttpsProxyAgent from 'https-proxy-agent';
import { WebClient } from '@slack/web-api';

import manTemplate from '../../templates/man';

const proxy = process.env.PROXY ? new HttpsProxyAgent(process.env.PROXY) : null;
const web = new WebClient(process.env.SLACK_TOKEN, { agent: proxy });

export async function man() {
  await web.chat.postMessage({
    blocks: manTemplate(),
    channel: process.env.CHANNEL_ID
  });
}
