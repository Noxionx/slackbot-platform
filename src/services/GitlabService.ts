import Gitlab from 'gitlab';
import { GitlabMergeRequest } from '../models/gitlab/GitlabMergeRequest';

export default class GitlabService {
  private api: any;

  constructor({ url, token }) {
    this.api = new Gitlab({
      url,
      token,
      rejectUnauthorized: false,
    });
  }

  /**
   * Get the list of all opened (and not WIP) merge requests for a project
   * @param projectId Project ID
   */
  async getMergeRequests(projectId: number): Promise<GitlabMergeRequest[]> {
    return await this.api.MergeRequests.all({
      projectId,
      state: 'opened',
      wip: 'no',
    });
  }

  /**
   * Check if a merge request has unresolved notes
   * @param mergeRequest Gitlab merge request object
   */
  async hasUnresolvedNotes(mergeRequest: GitlabMergeRequest): Promise<boolean> {
    const { project_id, iid } = mergeRequest;
    const notes = await this.api.MergeRequestNotes.all(project_id, iid);
    return notes.filter(n => n.resolvable).some(n => !n.resolved);
  }
}
