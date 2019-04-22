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
export async function list(event, mergeRequests = []) {
  console.log(mergeRequests);
  for (let mergeRequest of mergeRequests) {
    const title = mrTitle({
      link: mergeRequest.web_url,
      title: mergeRequest.title
    });
    const details = mrDetails({
      project: mergeRequest.project_id,
      author: mergeRequest.author.name,
      target: mergeRequest.target_branch
    });
    const status = mergeRequest.user_notes_count ? mrStatus() : [];

    await web.chat.postMessage({
      blocks: [...title, ...details, ...divider, ...status],
      channel: process.env.CHANNEL_ID
    });
  }
}
