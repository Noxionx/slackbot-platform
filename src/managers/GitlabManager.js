import { EventEmitter } from 'events';
import Gitlab from 'gitlab';

export default class GitlabManager extends EventEmitter {
  constructor({ url, token, projects = [] }) {
    super();
    this.projects = projects;
    this.api = new Gitlab({ url, token });
  }

  async init() {
    this.mergeRequests = [];
  }

  async fetchMergeRequests() {
    let mergeRequests = [];
    for (let project of this.projects) {
      const mr = await this.api.MergeRequests.all({
        projectId: project.id,
        state: 'opened',
        wip: 'no'
      });
      mergeRequests = [...this.mergeRequests, ...mr];
    }
    return mergeRequests;
  }

  async hasUnresolvedNotes(mergeRequest) {
    const { project_id, iid } = mergeRequest;
    const notes = await this.api.MergeRequestNotes.all(project_id, iid);
    return notes.filter(n => n.resolvable).some(n => !n.resolved);
  }
}
