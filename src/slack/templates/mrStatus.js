import STATUS_TYPES from '../../models/StatusType';

export default ({ reviews = [], hasUnresolvedNotes = false }) => [
  {
    type: 'context',
    elements: [
      {
        type: 'mrkdwn',
        text: genereateStatus(reviews, hasUnresolvedNotes)
      }
    ]
  }
];

export function genereateStatus(reviews, hasUnresolvedNotes) {
  let str = '';
  if (hasUnresolvedNotes) {
    str += ':warning: There is unresolved discussions';
  }
  if (reviews.length) {
    str += `${
      str.length ? '\n' : ''
    }:white_check_mark: This Merge Request has been reviewed ${
      reviews.length === 1 ? 'once' : 'twice'
    }`;
  }
  if (!str.length) {
    str += ':sparkles: New Merge Request to review';
  }
  return str;
}

export function getStatusIcon(status) {
  switch (status) {
  case STATUS_TYPES.NEW:
    return ':sparkles:';
  case STATUS_TYPES.UNRESOLVED:
    return ':warning:';
  case STATUS_TYPES.REVIEWED_ONCE:
    return ':white_check_mark:';
  case STATUS_TYPES.REVIEWED_TWICE:
    return ':heavy_check_mark:';
  default:
    return ':sparkles:';
  }
}
