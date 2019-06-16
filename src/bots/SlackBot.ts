import { Block } from '@slack/types';
import SlackService from '../services/SlackService';
import { SlackUser } from '../models/slack/SlackUser';
import {
  SlackMessageEvent,
  SlackReactionEvent,
  SlackBotMessage,
  SlackMessage,
} from '../models/slack/SlackEvent';

/**
 * Slack bot abstract class
 *
 * Extends this class to create a bot
 */
export default abstract class SlackBot {
  protected name: string;
  protected me: SlackUser;
  protected users: SlackUser[];

  private slackService: SlackService;

  constructor(name: string, token: string) {
    this.slackService = new SlackService(token);
    this.name = name;
  }

  // ABSTRACT METHODS
  /**
   * Called when a user mention the bot in the beginning of a message
   *
   * example : @botname The text of the message
   *
   * @param event Message event
   */
  abstract onUserMessage(event: SlackMessage): void;

  /**
   * Called when a bot has posted a message
   * @param event Message event
   */
  abstract onBotMessage(event: SlackBotMessage): void;

  /**
   * Called when a user mention the bot in the beginning of a message - Command parsing
   * @param cmd Command name
   * @param args Arguments list
   * @param user User ID
   * @param channel Channel ID
   * @param ts Message ID
   */
  abstract onCommand(
    cmd: string,
    args: any[],
    user: string,
    channel: string,
    ts: string,
  ): void;

  /**
   * Called when a user add a reaction on a message
   * @param reaction The reaction icon name
   * @param user User ID
   * @param channel Channel ID
   * @param ts Message ID
   */
  abstract onAddReaction(
    reaction: string,
    user: string,
    channel: string,
    ts: string,
  ): void;

  /**
   * Called when a user remove a reaction from a message
   * @param reaction The reaction icon name
   * @param user User ID
   * @param channel Channel ID
   * @param ts Message ID
   */
  abstract onRemoveReaction(
    reaction: string,
    user: string,
    channel: string,
    ts: string,
  ): void;

  // PROTECTED METHODS

  /**
   * Send a message to the channel
   * @param channel Channel ID
   * @param blocks Content
   */
  protected async sendMessage(
    channel: string,
    blocks: Block[],
  ): Promise<SlackBotMessage> {
    const rep = await this.slackService.sendToChannel(channel, blocks);
    return rep.message as SlackBotMessage;
  }

  /**
   * Send a direct message to the user
   * @param user User ID
   * @param blocks Content
   */
  protected async sendUserMessage(
    user: string,
    blocks: Block[],
  ): Promise<SlackBotMessage> {
    const rep = await this.slackService.sendDM(user, blocks);
    return rep.message as SlackBotMessage;
  }

  /**
   * Update a message on a channel
   * @param channel Channel ID
   * @param ts Message ID
   * @param blocks Content
   */
  protected async updateMessage(
    channel: string,
    ts: string,
    blocks: Block[],
  ): Promise<void> {
    await this.slackService.updateMessage(channel, ts, blocks);
  }

  /**
   * Initialisation function
   */
  protected async init(): Promise<void> {
    this.me = await this.slackService.getUserByName(this.name);
    if (!this.me) {
      throw new Error('Bot user not found in your workspace');
    }

    await this.slackService.rtmClient.start();

    this.slackService.rtmClient.on('message', (event: SlackMessageEvent) => {
      if (event.subtype && event.subtype === 'bot_message') {
        this.onBotMessage(event as SlackBotMessage);
      } else if (SlackService.isMessageForUser(this.me.id, event.text)) {
        this.onUserMessage(event as SlackMessage);
        const { cmd, args } = this.parseMessageToCommand(event.text);
        const { user, channel, ts } = event;
        this.onCommand(cmd, args, user, channel, ts);
      }
    });
    this.slackService.rtmClient.on(
      'reaction_added',
      (event: SlackReactionEvent) =>
        this.onAddReaction(
          event.reaction,
          event.user,
          event.item.channel,
          event.item.ts,
        ),
    );
    this.slackService.rtmClient.on(
      'reaction_removed',
      (event: SlackReactionEvent) =>
        this.onRemoveReaction(
          event.reaction,
          event.user,
          event.item.channel,
          event.item.ts,
        ),
    );
  }

  // PRIVATE METHODS

  private parseMessageToCommand(message: string) {
    const msgData = message.trim().split(' ');
    if (msgData.length < 2) {
      throw new Error('Missing command name');
    }
    const [, cmd, ...args] = msgData;
    return { cmd, args };
  }
}
