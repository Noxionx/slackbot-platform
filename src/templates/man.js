export default () => [
  {
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: '*Usage :*\n@botuser <command> [args]'
    }
  },
  {
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: MAN.map(({ command, info }) => buildManEntry(command, info)).join(
        '\n'
      )
    }
  }
];

const MAN = [
  { command: 'man', info: 'Print this help' },
  { command: 'list', info: 'List all opened Merge requests' }
];

function buildManEntry(command, info) {
  return `${command} ${info}`;
}
