export interface SlackEvent {
  type: string;
}

export interface SlackMessageEvent extends SlackEvent {
  user: string;
  channel: string;
  ts: string;
  text: string;
  subtype?: string;
  edited?: any;
  bot_id?: string;
  username?: string;
}

export interface SlackMessage extends SlackEvent {
  user: string;
  channel: string;
  ts: string;
  text: string;
  edited?: any;
}

export interface SlackBotMessage extends SlackEvent {
  subtype: string;
  ts: string;
  text: string;
  bot_id: string;
  username: string;
}

export interface SlackReactionEvent extends SlackEvent {
  reaction: string;
  user: string;
  item: SlackReactionItem;
  event_ts: string;
  ts: string;
}

export interface SlackReactionItem {
  type: string;
  channel: string;
  ts: string;
}
