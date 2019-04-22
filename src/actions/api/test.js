import HttpsProxyAgent from 'https-proxy-agent';
import { WebClient } from '@slack/web-api';

const proxy = process.env.PROXY ? new HttpsProxyAgent(process.env.PROXY) : null;
const web = new WebClient(process.env.SLACK_TOKEN, { agent: proxy });

/**
 * Test an API call
 * @returns callback The 'echo' payload
 */
export async function test() {
  return await web.api.test();
}
