import HttpsProxyAgent from 'https-proxy-agent';
import { WebClient } from '@slack/web-api';

const proxy = new HttpsProxyAgent(process.env.PROXY);
const web = new WebClient(process.env.SLACK_TOKEN, { agent: proxy });

/**
 * Test an API call
 * @returns callback The 'echo' payload
 */
export async function test() {
  return await web.api.test();
}
