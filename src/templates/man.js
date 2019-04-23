import { man } from '../actions';

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
  { command: 'list', info: 'List all opened Merge requests' }
];

function buildManEntry(command, info) {
  const maxLg = Math.max(...MAN_ENTRIES.map(e => e.command.length));
  return `${command}${'s'.repeat(maxLg - command.length)}\t${info}`;
}

function buildFullMan() {
  return `Usage :
@botuser <command> [args]

Commands :
${MAN_ENTRIES.map(({ command, info }) => buildManEntry(command, info)).join(
    '\n'
  )}`;
}

function wrapIntoCodeBlock(text) {
  return '```' + text + '```';
}
