const MAN_ENTRIES = [
  { command: 'man', info: 'Print this help' },
  { command: 'info', info: 'Display status icons details' },
  { command: 'list', info: 'List all opened Merge requests' },
  { command: 'show [id]', info: 'Show Merge request details' },
  { command: 'review [id]', info: 'Review / Unreview Merge request' }
];

export default class TemplateManager {
  man() {
    let man = 'Usage :\n';
    man += '@botuser <command> [args]\n\n';
    man += 'Commands :\n';
    man += `${MAN_ENTRIES.map(buildManEntry).join('\n')}`;

    return [section(markdown(codeBloc(man)))];
  }

  info() {
    let txt = '*Status*\n';
    txt += ':sparkles: : New merge request\n';
    txt += ':warning: : The merge request has unresolved discussions\n';
    txt +=
      ':white_check_mark: : The merge request has been reviewed by one person\n';
    txt +=
      ':heavy_check_mark: : The merge request has been reviewed by two persons and is ready be merged';

    return [section(markdown(txt))];
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
    return blocks;
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
