import { WebClient } from '@slack/web-api';

const web = new WebClient(process.env.SLACK_TOKEN);

/**
 * Test an API call
 * @returns callback The 'echo' payload
 */
export async function test() {
  return await web.api.test();
}
