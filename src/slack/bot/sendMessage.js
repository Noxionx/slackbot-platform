import WebClient from '../webClient';

export async function sendMessage({ text, channel, user }) {
  await WebClient.chat.postEphemeral({ text, channel, user });
}
