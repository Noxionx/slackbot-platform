export default () => [
  {
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: getText()
    }
  }
];

function getText() {
  return `*Status*
:sparkles: : New merge request
:warning: : The merge request has unresolved discussions
:white_check_mark: : The merge request has been reviewed by one person
:heavy_check_mark: : The merge request has been reviewed by two persons and is ready be merged`;
}
