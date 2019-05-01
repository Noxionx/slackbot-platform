const MAN_ENTRIES = [
  { command: 'man', info: 'Print this help' },
  { command: 'info', info: 'Display reactions icons details' },
  { command: 'list', info: 'List all opened Merge requests' }
];

const MIN_REVIEWS = 2;

export default class TemplateManager {
  man() {
    let man = 'Usage :\n';
    man += '@botuser <command> [args]\n\n';
    man += 'Commands :\n';
    man += `${MAN_ENTRIES.map(buildManEntry).join('\n')}`;

    return { blocks: [section(markdown(codeBloc(man)))] };
  }

  info() {
    let txt = '*Reactions*\n';
    txt += ':eyes: :eyeglasses: : Start a review\n';
    txt += ':white_check_mark: :heavy_check_mark: : Approve a review\n';

    return { blocks: [section(markdown(txt))] };
  }

  listMergeRequests(mergeRequests = []) {
    let blocks = [];
    for (let mr of mergeRequests) {
      const title = section(markdown(`*<${mr.web_url}|${mr.title}>*`));
      const details = context([
        markdown(`*ID:* ${mr.id}`),
        markdown(`*Project:* ${mr.project}`),
        markdown(`*Target Branch:* ${mr.target}`),
        markdown(`*Author:* ${mr.author}`)
      ]);
      const row = [title, details, divider()];
      blocks = [...blocks, ...row];
    }
    return { blocks };
  }

  mergeRequest(mergeRequest) {
    const title = section(
      markdown(`*<${mergeRequest.web_url}|${mergeRequest.title}>*`)
    );
    const details = context([
      markdown(`*Project:* ${mergeRequest.project_name}`),
      markdown(`*Target Branch:* ${mergeRequest.target_branch}`),
      markdown(`*Author:* ${mergeRequest.author.name}`)
    ]);
    const status = context([markdown(getMergeRequestStatus(mergeRequest))]);
    return { blocks: [title, details, divider(), status] };
  }
}

/**
 * Build a man entry according to all entries for alignment
 */
function buildManEntry({ command, info }) {
  // We search for the command with the maximum length
  const maxLg = Math.max(...MAN_ENTRIES.map(e => e.command.length));
  // We add spaces to align all the info
  return `${command}${' '.repeat(maxLg - command.length)}\t${info}`;
}

function getMergeRequestStatus(mergeRequest) {
  let str = '';
  if (mergeRequest.hasUnresolvedNotes) {
    str += ':warning: There is unresolved discussions';
  }
  if (mergeRequest.reviewers && mergeRequest.reviewers.length) {
    mergeRequest.reviewers.forEach((r, i) => {
      if (mergeRequest.hasUnresolvedNotes || i > 0) {
        str += '\n';
      }
      if (
        mergeRequest.validators &&
        mergeRequest.validators.indexOf(r) !== -1
      ) {
        str += `:${
          i === 0 ? 'white' : 'heavy'
        }_check_mark: This Merge Request has been approved by <@${r}>`;
      } else {
        str += `:eyes: This Merge Request is being reviewed by <@${r}>`;
      }
    });
  }
  if (!mergeRequest.hasUnresolvedNotes) {
    if (
      mergeRequest.reviewers.length &&
      mergeRequest.reviewers.length === mergeRequest.validators.length &&
      mergeRequest.validators.length < MIN_REVIEWS
    ) {
      str += '\n:pray: More review(s) needed :pray:';
    } else if (mergeRequest.validators.length === MIN_REVIEWS) {
      str += '\n:tada: Ready to merge !';
    }
  }
  if (!str.length) {
    str += ':loudspeaker: :sparkles: New Merge Request to review';
  }
  return str;
}

/**
 * BLOCK ELEMENTS
 */
function section(text) {
  return { type: 'section', text };
}

function context(elements) {
  return { type: 'context', elements };
}

function markdown(text) {
  return { type: 'mrkdwn', text };
}

function plainText(text) {
  return { type: 'plain_text', text, emoji: true };
}

function divider() {
  return { type: 'divider' };
}

function code(text) {
  return '`' + text + '`';
}

function codeBloc(text) {
  return '```' + text + '```';
}
