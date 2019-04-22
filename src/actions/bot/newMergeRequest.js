import HttpsProxyAgent from 'https-proxy-agent';
import { WebClient } from '@slack/web-api';

import mrTitle from '../../templates/mrTitle';
import mrStatus from '../../templates/mrStatus';
import mrDetails from '../../templates/mrDetails';

const divider = [{ type: 'divider' }];

const proxy = process.env.PROXY ? new HttpsProxyAgent(process.env.PROXY) : null;
const web = new WebClient(process.env.SLACK_TOKEN, { agent: proxy });

/**
 * Create a new message for a merge request
 */
export async function newMergeRequest() {
  const title = mrTitle({
    link: 'http://www.google.com',
    title: 'Test link :tada:'
  });
  const status = mrStatus();
  const details = mrDetails({
    project: 'FO',
    author: 'noxionx',
    target: 'develop'
  });

  await web.chat.postMessage({
    blocks: [...title, ...details, ...divider, ...status],
    channel: process.env.CHANNEL_ID
  });
}
