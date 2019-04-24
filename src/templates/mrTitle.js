import { getStatusIcon } from './mrStatus';

export default ({ link, title, status }, showStatus = false) => [
  {
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: `${
        showStatus ? `${getStatusIcon(status)} ` : ''
      }*<${link}|${title}>*`
    }
  }
];
