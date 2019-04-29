import STATUS_TYPES from '../../models/StatusType';

export default () => [
  {
    type: 'context',
    elements: [
      {
        type: 'mrkdwn',
        text: ':warning: There is unresolved discussions'
      }
    ]
  }
];

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
  }
}
