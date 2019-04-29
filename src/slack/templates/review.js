export function reviewForMe({ mergeRequest, project, remove = false }) {
  return [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `${remove ? 'Canceled' : 'Started'} review for Merge Request *${
          mergeRequest.iid
        }* on project *${project.name}*\n${mergeRequest.web_url}`
      }
    }
  ];
}
