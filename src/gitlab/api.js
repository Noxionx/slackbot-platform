import https from 'https';
import MergeRequest from '../models/MergeRequest';
import Group from '../models/Group';
import Project from '../models/Project';

const API_PATH = '/api/v4';

export async function getGroups() {
  console.log('Get Groups...');
  const groups = await getAllPages('/groups');
  return groups.map(g => new Group(g));
}

export async function getProjects() {
  console.log('Get Projects...');
  const groups = await getGroups();
  let projects = [];
  for (let group of groups) {
    projects = [
      ...projects,
      ...(await getAllPages(`/groups/${group.id}/projects`))
    ];
  }
  return projects.map(p => new Project(p));
}

export async function getOpenedMRForProject(project) {
  const mergeRequests = await getAllPages(
    `/project/${project}/merge_requests`,
    { state: 'opened' }
  );
  return mergeRequests.map(mr => new MergeRequest(mr));
}

export async function getAllOpenedMR() {
  const projects = await getProjects();
  let mergeRequests = [];
  for (let p of projects) {
    mergeRequests = [...mergeRequests, ...(await getOpenedMRForProject(p.id))];
  }
  return mergeRequests;
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
    console.log(headers);
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
