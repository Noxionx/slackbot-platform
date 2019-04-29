import https from 'https';
import MergeRequest from '../models/MergeRequest';
import Group from '../models/Group';
import Project from '../models/Project';
import STATUS_TYPES from '../models/StatusType';

const API_PATH = '/api/v4';

export async function getGroups() {
  const groups = await getAllPages('/groups');
  return groups.map(g => new Group(g));
}

export async function getProjects() {
  const projects = await getAllPages('/project');
  return projects.map(p => new Project(p));
}

export async function getProject(projectId) {
  const { body } = await get(`/projects/${projectId}`);
  return new Project(body);
}

export async function getProjectsOfGroup(groupId) {
  const projects = await getAllPages(`/groups/${groupId}/projects`);
  return projects.map(p => new Project(p));
}

export async function getOpenedMRForProject(projectId) {
  const mergeRequests = await getAllPages(
    `/projects/${projectId}/merge_requests`,
    { state: 'opened', wip: 'no' }
  );
  const newList = [];
  for (let mr of mergeRequests) {
    newList.push(
      new MergeRequest({ ...mr, status: await getMRStatus(projectId, mr) })
    );
  }
  return newList;
}

export async function getAllOpenedMR() {
  const groups = await getGroups();
  let projects = [];
  for (let g of groups) {
    projects = [...projects, ...(await getProjectsOfGroup(g.id))];
  }
  let mergeRequests = [];
  for (let p of projects) {
    mergeRequests = [...mergeRequests, ...(await getOpenedMRForProject(p.id))];
  }
  return mergeRequests;
}

/**
 * Private functions
 */

async function getMRStatus(projectId, mr) {
  const notes = await getAllPages(
    `/projects/${projectId}/merge_requests/${mr.iid}/notes`
  );
  const hasUnresolvedNotes = notes
    .filter(n => n.resolvable)
    .some(n => !n.resolved);
  if (hasUnresolvedNotes) {
    return STATUS_TYPES.UNRESOLVED;
  } else {
    // TODO : Handle reviews
    return STATUS_TYPES.NEW;
  }
}

async function getAllPages(path = '', params = {}) {
  let h = {
    'x-next-page': '1'
  };
  let data = [];
  do {
    const p = {
      ...params,
      page: h['x-next-page']
    };
    const { headers, body } = await get(getFullPath(path, p));
    h = headers;
    data = [...data, ...body];
  } while (h['x-next-page']);
  return data;
}

function get(path = '') {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: process.env.GITLAB_URL,
      path: `${API_PATH}${path}`,
      headers: {
        'Private-Token': process.env.GITLAB_TOKEN
      }
    };
    https
      .get(options, res => {
        const headers = res.headers;
        let str = '';
        res.on('data', d => (str = str + d.toString()));
        res.on('end', () => resolve({ headers, body: JSON.parse(str) }));
      })
      .on('error', reject);
  });
}

function getFullPath(path = '', params = {}) {
  const query = Object.keys(params)
    .map(key => `${key}=${params[key]}`)
    .join('&');
  return `${path}?${query}`;
}
