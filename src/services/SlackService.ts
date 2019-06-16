import HttpsProxyAgent from 'https-proxy-agent';
import { RTMClient } from '@slack/rtm-api';
import { WebClient, WebAPICallResult, Block } from '@slack/web-api';
import { SlackUser } from '../models/slack/SlackUser';
import { SlackIM } from '../models/slack/SlackIM';

export default class SlackService {
  public webClient: WebClient;
  public rtmClient: RTMClient;

  constructor(token: string) {
    const proxy = process.env.PROXY
      ? new HttpsProxyAgent(process.env.PROXY)
      : null;

    this.rtmClient = new RTMClient(token, { agent: proxy });
    this.webClient = new WebClient(token, { agent: proxy });
  }

  /**
   * Get list of all users on the workspace
   */
  async getUserList(): Promise<SlackUser[]> {
    const rep = await this.webClient.users.list();
    return rep.members as SlackUser[];
  }

  /**
   * Get a user by id
   */
  async getUserById(id: string): Promise<SlackUser> {
    const users = await this.getUserList();
    return [...users].filter(u => !u.deleted).find(u => u.id === id);
  }

  /**
   * Get a user by name
   */
  async getUserByName(name: string): Promise<SlackUser> {
    const users = await this.getUserList();
    return [...users].filter(u => !u.deleted).find(u => u.name === name);
  }

  /**
   * Get list of all direct messages of the bot
   */
  async getAllDM(): Promise<SlackIM[]> {
    const rep = await this.webClient.im.list();
    return rep.ims as SlackIM[];
  }

  /**
   * Get the DM channel ID for a user ID
   */
  async getDMFor(user: string): Promise<string> {
    if (!user) {
      throw new Error('Missing user ID');
    }
    const list = await this.getAllDM();
    let channel = list.find(im => im.user === user);
    if (!channel) {
      const rep = await this.webClient.im.open({ user });
      channel = rep.channel as SlackIM;
    }
    return channel.id;
  }

  /**
   * Send a message to the main channel
   */
  async sendToChannel(
    channel: string,
    blocks: Block[],
  ): Promise<WebAPICallResult> {
    return await this.webClient.chat.postMessage({
      text: null,
      blocks,
      channel,
    });
  }

  /**
   * Send a direct message to the user
   */
  async sendDM(user: string, blocks: Block[]): Promise<WebAPICallResult> {
    return await this.webClient.chat.postMessage({
      text: null,
      blocks,
      channel: await this.getDMFor(user),
    });
  }

  /**
   * Send a message, in a channel, that is only visible by the user
   */
  async whisp(
    user: string,
    channel: string,
    blocks: Block[],
  ): Promise<WebAPICallResult> {
    return await this.webClient.chat.postEphemeral({
      text: null,
      blocks,
      channel,
      user,
    });
  }

  /**
   * Update a message
   */
  async updateMessage(
    channel: string,
    ts: string,
    blocks: Block[],
  ): Promise<WebAPICallResult> {
    return await this.webClient.chat.update({
      text: null,
      blocks,
      channel,
      ts,
    });
  }

  /**
   * Update a direct message for a user
   */
  async updateDM(
    user: string,
    ts: string,
    blocks: Block[],
  ): Promise<WebAPICallResult> {
    return await this.updateMessage(await this.getDMFor(user), ts, blocks);
  }

  /**
   * Remove a message
   * @param {string} channel The channel ID
   * @param {string} ts The ts value of the message to delete
   */
  async removeMessage(channel: string, ts: string): Promise<WebAPICallResult> {
    return await this.webClient.chat.delete({
      channel,
      ts,
    });
  }

  /**
   * Remove a direct message for a user
   */
  async removeDM(user: string, ts: string): Promise<WebAPICallResult> {
    return await this.removeMessage(await this.getDMFor(user), ts);
  }

  /**
   * Get a permalink for a message
   * @param {string} channel The channel ID
   * @param {string} ts The ts value of the message
   */
  async getMessageLink(channel: string, ts: string): Promise<WebAPICallResult> {
    return await this.webClient.chat.getPermalink({
      channel,
      message_ts: ts,
    });
  }

  static isMessageForUser(user: string = '', message: string) {
    if (!message) {
      return false;
    }
    return (
      message
        .trim()
        .slice(2) // Message format : "<@USERID> message"
        .indexOf(user) === 0
    );
  }
}
