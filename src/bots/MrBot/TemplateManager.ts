import dayjs from 'dayjs';
import { Block } from '@slack/types';
import {
  section,
  markdown,
  codeBloc,
  context,
  divider,
} from '../../services/SlackTemplateService';
import { MergeRequest } from './MergeRequest';

const MAN_ENTRIES = [
  { command: 'man', info: 'Print this help' },
  { command: 'info', info: 'Display reactions icons details' },
];

const MIN_REVIEWS = 2;

export default class TemplateManager {
  static man(): Block[] {
    let man = 'Usage :\n';
    man += '@botuser <command> [args]\n\n';
    man += 'Commands :\n';
    man += `${MAN_ENTRIES.map(e => this.buildManEntry(e)).join('\n')}`;

    return [section(markdown(codeBloc(man)))];
  }

  static info(): Block[] {
    let txt = '*Reactions*\n';
    txt += ':eyes: :eyeglasses: : Start a review\n';
    txt += ':white_check_mark: :heavy_check_mark: : Approve a review\n';

    return [section(markdown(txt))];
  }

  static listMergeRequests(mergeRequests: MergeRequest[] = []): Block[] {
    let blocks = [];
    for (const mr of mergeRequests) {
      const title = section(markdown(`*<${mr.web_url}|${mr.title}>*`));
      const details = context([
        markdown(`*ID:* ${mr.id}`),
        markdown(`*Project:* ${mr.projectName}`),
        markdown(`*Target Branch:* ${mr.target_branch}`),
        markdown(`*Author:* ${mr.author}`),
      ]);
      const row = [title, details, divider()];
      blocks = [...blocks, ...row];
    }
    return blocks;
  }

  static mergeRequest(mergeRequest: MergeRequest): Block[] {
    const date = dayjs(mergeRequest.created_at);
    return [
      // Title
      section(
        markdown(
          `*${mergeRequest.projectName}* : <${mergeRequest.web_url}|${mergeRequest.title}>`,
        ),
      ),
      // Merge request details
      context([
        markdown(`*Date:* ${date.format('DD/MM/YYYY HH:mm')}`),
        markdown(`*Target Branch:* ${mergeRequest.target_branch}`),
        markdown(`*Author:* ${mergeRequest.author.name}`),
      ]),

      divider(),

      // Merge request status
      context([markdown(this.getMergeRequestStatus(mergeRequest))]),
    ];
  }

  /**
   * Build a man entry according to all entries for alignment
   */
  private static buildManEntry({ command, info }): string {
    // We search for the command with the maximum length
    const maxLg = Math.max(...MAN_ENTRIES.map(e => e.command.length));
    // We add spaces to align all the info
    return `${command}${' '.repeat(maxLg - command.length)}\t${info}`;
  }

  private static getMergeRequestStatus(mergeRequest: MergeRequest): string {
    const status = [];
    if (mergeRequest.hasNotes) {
      status.push(':warning: There is unresolved discussions');
    }
    if (mergeRequest.reviewers && mergeRequest.reviewers.length) {
      mergeRequest.reviewers.forEach((r, i) => {
        if (
          mergeRequest.validators &&
          mergeRequest.validators.indexOf(r) !== -1
        ) {
          status.push(
            `:${
              i === 0 ? 'white' : 'heavy'
            }_check_mark: This Merge Request has been approved by <@${r}>`,
          );
        } else {
          status.push(`:eyes: This Merge Request is being reviewed by <@${r}>`);
        }
      });
    }
    if (!mergeRequest.hasNotes) {
      if (
        mergeRequest.reviewers.length &&
        mergeRequest.reviewers.length === mergeRequest.validators.length &&
        mergeRequest.validators.length < MIN_REVIEWS
      ) {
        status.push(':pray: More review(s) needed :pray:');
      } else if (mergeRequest.validators.length === MIN_REVIEWS) {
        status.push(':tada: Ready to merge !');
      }
    }
    if (!status.length) {
      status.push(':loudspeaker: :sparkles: New Merge Request to review');
    }
    return status.join('\n');
  }
}
