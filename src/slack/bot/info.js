import WebClient from '../webClient';

import { imFor } from '../api';

import infoTemplate from '../templates/info';

export async function info({ event }) {
  await WebClient.chat.postMessage({
    blocks: infoTemplate(),
    channel: await imFor(event.user)
  });
}
