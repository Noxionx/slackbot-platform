export default ({ id, link, title }) => [
  {
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: `*<${link}|${title}>* (id : ${id})`
    }
  }
];
