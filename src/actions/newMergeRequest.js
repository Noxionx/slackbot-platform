import { WebClient } from '@slack/web-api';
import newMergeRequestTemplate from '../templates/newMergeRequest';
const web = new WebClient(process.env.SLACK_TOKEN);

/**
 * Create a new message for a merge request
 */
export async function newMergeRequest(channel = '') {
  await web.chat.postMessage({
    blocks: newMergeRequestTemplate,
    channel
  });
}
