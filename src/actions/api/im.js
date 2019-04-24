import WebClient from '../webClient';

/**
 * Get list of all direct messages for the bot
 * @returns channels
 */
export async function imList() {
  const rep = await WebClient.im.list();
  return rep.ims;
}

/**
 * Get the im channel ID for a user ID
 * @returns channelId
 */
export async function imFor(userId) {
  if (!userId) {
    throw 'Missing user ID';
  }
  const list = await imList();
  const channel = list.find(im => im.user == userId);
  let channelId;
  if (channel) {
    channelId = channel.id;
  } else {
    const rep = await WebClient.im.open({ user: userId });
    channelId = rep.channel.id ? rep.channel.id : null;
  }
  return channelId;
}
