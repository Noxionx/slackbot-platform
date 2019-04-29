export default ({ id, project, author, target }) => [
  {
    type: 'context',
    elements: [
      {
        type: 'mrkdwn',
        text: `*ID:* ${id}`
      },
      {
        type: 'mrkdwn',
        text: `*Project:* ${project}`
      },
      {
        type: 'mrkdwn',
        text: `*Target Branch:* ${target}`
      },
      {
        type: 'mrkdwn',
        text: `*Author:* ${author}`
      }
    ]
  }
];
