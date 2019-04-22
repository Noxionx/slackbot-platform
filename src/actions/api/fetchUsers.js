import HttpsProxyAgent from 'https-proxy-agent';
import { WebClient } from '@slack/web-api';

const proxy = process.env.PROXY ? new HttpsProxyAgent(process.env.PROXY) : null;
const web = new WebClient(process.env.SLACK_TOKEN, { agent: proxy });

/**
 * Get list of all users on the workspace
 * @returns users
 */
export async function fetchUsers() {
  const rep = await web.users.list();
  return rep.members;
}
