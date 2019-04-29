import WebClient from '../webClient';

import mrTitle from '../templates/mrTitle';
import mrStatus from '../templates/mrStatus';
import mrDetails from '../templates/mrDetails';
import { imFor } from '../api';

const RE = /show (\d+)/g;

const divider = [{ type: 'divider' }];

/**
 * Create a new message for a merge request
 */
export async function show({ event, mergeRequests = [], projects = {} }) {
  const iid = RE.exec(event.text)[1];
  if (!iid) {
    throw 'Missing merge request iid !';
  }
  const mergeRequest = mergeRequests.find(mr => mr.iid == iid);
  if (!mergeRequest) {
    throw 'Merge request not found';
  }
  let blocks = [];
  const title = mrTitle({
    link: mergeRequest.web_url,
    title: mergeRequest.title
  });
  const details = mrDetails({
    id: mergeRequest.iid,
    project: projects[mergeRequest.project_id].name || mergeRequest.project_id,
    author: mergeRequest.author.name,
    target: mergeRequest.target_branch
  });
  const row = [...title, ...details, ...divider];
  blocks = [...blocks, ...row];

  await WebClient.chat.postMessage({
    blocks,
    channel: await imFor(event.user)
  });
}
