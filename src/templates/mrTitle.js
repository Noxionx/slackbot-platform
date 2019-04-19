export default ({ link, title }) => [
  {
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: `*<${link}|${title}>*`
    }
  }
];
