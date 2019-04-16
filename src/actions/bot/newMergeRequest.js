import HttpsProxyAgent from 'https-proxy-agent';
import { WebClient } from '@slack/web-api';
import newMergeRequestTemplate from '../../templates/newMergeRequest';

const proxy = new HttpsProxyAgent(process.env.PROXY);
const web = new WebClient(process.env.SLACK_TOKEN, { agent: proxy });

/**
 * Create a new message for a merge request
 */
export async function newMergeRequest() {
  await web.chat.postMessage({
    blocks: newMergeRequestTemplate,
    channel: process.env.CHANNEL_ID
  });
}
