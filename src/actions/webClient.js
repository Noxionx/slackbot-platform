import HttpsProxyAgent from 'https-proxy-agent';
import { WebClient } from '@slack/web-api';

const proxy = process.env.PROXY ? new HttpsProxyAgent(process.env.PROXY) : null;

const webClient = new WebClient(process.env.SLACK_TOKEN, { agent: proxy });

export default webClient;
