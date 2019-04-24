import WebClient from '../webClient';

/**
 * Test an API call
 * @returns callback The 'echo' payload
 */
export async function test() {
  return await WebClient.api.test();
}
