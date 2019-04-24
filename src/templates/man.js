export default () => [
  {
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: wrapIntoCodeBlock(buildFullMan())
    }
  }
];

const MAN_ENTRIES = [
  { command: 'man', info: 'Print this help' },
  { command: 'list', info: 'List all opened Merge requests' },
  { command: 'show [id]', info: 'Show Merge request details' }
];

/**
 * Build a man entry according to all entries for alignment
 */
function buildManEntry({ command, info }) {
  // We search for the command with the maximum length
  const maxLg = Math.max(...MAN_ENTRIES.map(e => e.command.length));
  // We add spaces to align all the info
  return `${command}${' '.repeat(maxLg - command.length)}\t${info}`;
}

/**
 * Create the Man string
 */
function buildFullMan() {
  return `Usage :
@botuser <command> [args]

Commands :
${MAN_ENTRIES.map(buildManEntry).join('\n')}`;
}

/**
 * Wrap the input text into a markdown code block
 * @param {string} text
 */
function wrapIntoCodeBlock(text) {
  return '```' + text + '```';
}
