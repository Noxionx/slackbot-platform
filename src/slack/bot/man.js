import WebClient from '../webClient';

import { imFor } from '../api';

import manTemplate from '../templates/man';

export async function man({ event }) {
  await WebClient.chat.postMessage({
    blocks: manTemplate(),
    channel: await imFor(event.user)
  });
}
