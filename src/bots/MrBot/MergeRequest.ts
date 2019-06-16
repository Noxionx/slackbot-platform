import { GitlabMergeRequest } from '../../models/gitlab/GitlabMergeRequest';

export interface MergeRequest extends GitlabMergeRequest {
  /**
   * The name of the project
   */
  projectName: string;

  /**
   * True if the merge request has unresolved notes
   */
  hasNotes: boolean;

  /**
   * The list of slack user's id who reviewed the merge request
   */
  reviewers: string[];

  /**
   * The list of slack user's id who validated the merge request
   */
  validators: string[];

  /**
   * The slack message id attached to this merge request
   */
  ts: string;
}
