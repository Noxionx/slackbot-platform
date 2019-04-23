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
export async function list(event, { mergeRequests = [], projects = {} }) {
  let blocks = [];
  for (let mergeRequest of mergeRequests) {
    const title = mrTitle({
      link: mergeRequest.web_url,
      title: mergeRequest.title,
      id: mergeRequest.id
    });
    const details = mrDetails({
      project:
        projects[mergeRequest.project_id].name || mergeRequest.project_id,
      author: mergeRequest.author.name,
      target: mergeRequest.target_branch
    });
    const row = [...title, ...details, ...divider];
    blocks = [...blocks, ...row];
  }
  if (event.channel === process.env.CHANNEL_ID) {
    try {
      await web.chat.delete({
        channel: event.channel,
        ts: event.ts
      });
    } catch (e) {
      console.log(e);
    }
    await web.chat.postEphemeral({
      blocks,
      channel: event.channel,
      user: event.user
    });
  } else {
    await web.chat.postMessage({
      blocks,
      channel: event.channel
    });
  }
}
