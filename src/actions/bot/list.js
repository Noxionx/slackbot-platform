import WebClient from '../webClient';

import mrTitle from '../../templates/mrTitle';
import mrDetails from '../../templates/mrDetails';
import { imFor } from '../api';

const divider = [{ type: 'divider' }];

/**
 * Create a new message for a merge request
 */
export async function list({ event, mergeRequests = [], projects = {} }) {
  let blocks = [];
  for (let mergeRequest of mergeRequests) {
    console.log(mergeRequest.status);
    const title = mrTitle(
      {
        link: mergeRequest.web_url,
        title: mergeRequest.title,
        status: mergeRequest.status
      },
      true
    );
    const details = mrDetails({
      id: mergeRequest.iid,
      project:
        projects[mergeRequest.project_id].name || mergeRequest.project_id,
      author: mergeRequest.author.name,
      target: mergeRequest.target_branch
    });
    const row = [...title, ...details, ...divider];
    blocks = [...blocks, ...row];
  }
  await WebClient.chat.postMessage({
    blocks,
    channel: await imFor(event.user)
  });
}
