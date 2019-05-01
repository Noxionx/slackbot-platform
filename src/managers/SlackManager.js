import { EventEmitter } from 'events';
import { WebClient } from '@slack/web-api';
import { RTMClient } from '@slack/rtm-api';

export default class SlackManager extends EventEmitter {
  constructor({ token, botName, mainChannel, proxy }) {
    super();
    this.botName = botName;
    this.mainChannel = mainChannel;

    this.webClient = new WebClient(token, { agent: proxy });
    this.rtmClient = new RTMClient(token, { agent: proxy });
  }

  async init() {
    this.me = this.getBotUser();
    if (!this.me) {
      throw 'Bot user not found in your workspace';
    }

    await this.rtmClient.start();
    this.rtmClient.on('message', event => {
      if (!event.text || !isBotMessage(this.me.id, event.text)) {
        return;
      }
      const { cmd, args } = parseMessageToCommand(event.text);
      this.emit(cmd, args);
    });
  }

  /**
   * Get list of all users on the workspace
   * @returns {Promise<any[]>} users
   */
  async getUserList() {
    const rep = await this.webClient.users.list();
    return rep.members;
  }

  /**
   * Retreive the bot user
   * @returns {Promise<any>} botUser
   */
  async getBotUser() {
    const users = await this.getUserList();
    return [...users]
      .filter(u => !u.deleted)
      .find(u => u.name === this.botName);
  }

  /**
   * Get list of all direct messages for the bot
   * @returns {Promise<string[]>} channels
   */
  async getAllDM() {
    const rep = await this.webClient.im.list();
    return rep.ims;
  }

  /**
   * Get the DM channel ID for a user ID
   * @param {string} userId
   * @returns {Promise<string>} channelId
   */
  async getDMFor(userId) {
    if (!userId) {
      throw 'Missing user ID';
    }
    const list = await this.getAllDM();
    const channel = list.find(im => im.user == userId);
    let channelId;
    if (channel) {
      channelId = channel.id;
    } else {
      const rep = await this.webClient.im.open({ user: userId });
      channelId = rep.channel.id ? rep.channel.id : null;
    }
    return channelId;
  }

  /**
   * Send a message to the main channel
   * @param {{text: string, blocks: any[]}} args An object with either blocks or text property
   */
  async sendToMain(args) {
    await this.webClient.chat.postMessage({
      ...args,
      channel: this.mainChannel
    });
  }

  /**
   * Send a direct message to the user
   * @param {string} user The user id
   * @param {{text: string, blocks: any[]}} args An object with either blocks or text property
   */
  async sendDM(user, args) {
    await this.webClient.chat.postMessage({
      ...args,
      channel: await this.getDMFor(user)
    });
  }

  /**
   * Send a message, in a channel, that is only visible by the user
   * @param {string} user The user id
   * @param {string} channel The channel id
   * @param {{text: string, blocks: any[]}} args An object with either blocks or text property
   */
  async whisp(user, channel, args) {
    await this.webClient.chat.postEphemeral({
      ...args,
      channel,
      user
    });
  }
}

/**
 * Check if the message is addressed to the bot
 * @param {string} botId The bot user id
 * @param {string} message The raw message
 * @returns {boolean} isBotMessage
 */
function isBotMessage(botId = '', message = '') {
  return (
    message
      .trim()
      .slice(2) // Message format : "<@BOTID> message"
      .indexOf(botId) === 0
  );
}

/**
 * Parse the message into a command + args object
 * @param {string} message The raw message
 * @returns {{cmd: string, args: any[]}} The command data
 */
function parseMessageToCommand(message) {
  const msgData = message.trim().split(' ');
  if (msgData.length < 2) {
    throw 'Missing command name';
  }
  const [, cmd, ...args] = msgData;
  return { cmd, args };
}
