import WebClient from '../webClient';

/**
 * Get list of all users on the workspace
 * @returns users
 */
export async function fetchUsers() {
  const rep = await WebClient.users.list();
  return rep.members;
}
