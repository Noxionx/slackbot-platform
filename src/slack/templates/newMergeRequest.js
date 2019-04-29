export default [
  {
    type: 'section',
    text: {
      type: 'mrkdwn',
      text:
        '*<fakeLink.toEmployeeProfile.com|NO-JIRA (tech) : TU \'DocumentsComponent\'>*'
    }
  },
  {
    type: 'context',
    elements: [
      {
        type: 'plain_text',
        text: ':warning: There is unresolved discussions',
        emoji: true
      }
    ]
  },
  {
    type: 'divider'
  },
  {
    type: 'section',
    fields: [
      {
        type: 'mrkdwn',
        text: '*Author:*\n@noxionx'
      },
      {
        type: 'mrkdwn',
        text: '*Project:*\nfront-end'
      },
      {
        type: 'mrkdwn',
        text: '*Status:*\nopen'
      },
      {
        type: 'mrkdwn',
        text: '*Target Branch:*\ndevelop'
      }
    ]
  },
  {
    type: 'divider'
  },
  {
    type: 'actions',
    elements: [
      {
        type: 'button',
        text: {
          type: 'plain_text',
          text: 'Review'
        },
        value: 'click_review'
      },
      {
        type: 'button',
        text: {
          type: 'plain_text',
          text: 'Merge'
        },
        value: 'click_merge',
        style: 'primary',
        confirm: {
          title: {
            type: 'plain_text',
            text: 'Confirmation'
          },
          text: {
            type: 'mrkdwn',
            text: 'Do you really want to merge ?'
          },
          confirm: {
            type: 'plain_text',
            text: 'Yes'
          },
          deny: {
            type: 'plain_text',
            text: 'No'
          }
        }
      }
    ]
  },
  {
    type: 'context',
    elements: [
      {
        type: 'mrkdwn',
        text: 'Waiting for 2 more reviews'
      },
      {
        type: 'mrkdwn',
        text: '*Reviewers* : @noxionx, @antoine'
      }
    ]
  }
];
