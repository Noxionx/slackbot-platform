import {
  PlainTextElement,
  MrkdwnElement,
  SectionBlock,
  ContextBlock,
  DividerBlock,
} from '@slack/types';

/**
 * BLOCK ELEMENTS
 */
export function section(text: PlainTextElement | MrkdwnElement): SectionBlock {
  return { type: 'section', text };
}

export function context(
  elements: PlainTextElement[] | MrkdwnElement[],
): ContextBlock {
  return { type: 'context', elements };
}

export function markdown(text: string): MrkdwnElement {
  return { type: 'mrkdwn', text };
}

export function plainText(text: string): PlainTextElement {
  return { type: 'plain_text', text, emoji: true };
}

export function divider(): DividerBlock {
  return { type: 'divider' };
}

export function code(text: string): string {
  return '`' + text + '`';
}

export function codeBloc(text: string): string {
  return '```' + text + '```';
}
