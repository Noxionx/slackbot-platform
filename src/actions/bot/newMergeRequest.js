import WebClient from '../webClient';

import mrTitle from '../../templates/mrTitle';
import mrStatus from '../../templates/mrStatus';
import mrDetails from '../../templates/mrDetails';

const divider = [{ type: 'divider' }];

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

  await WebClient.chat.postMessage({
    blocks: [...title, ...details, ...divider, ...status],
    channel: process.env.CHANNEL_ID
  });
}
