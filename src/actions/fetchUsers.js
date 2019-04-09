import { WebClient } from '@slack/web-api';

const web = new WebClient(process.env.SLACK_TOKEN);

/**
 * Get list of all users on the workspace
 * @returns users
 */
export async function fetchUsers() {
  const rep = await web.users.list();
  return rep.members;
}
