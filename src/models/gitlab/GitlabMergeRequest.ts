import { GitlabUser } from './GitlabUser';

export interface GitlabMergeRequest {
  id: number;
  iid: number;
  project_id: number;
  title: string;
  description: string;
  state: string;
  created_at: string;
  updated_at: string;
  merged_by: GitlabUser;
  merged_at: string;
  closed_by: GitlabUser;
  closed_at: string;
  target_branch: string;
  source_branch: string;
  author: GitlabUser;
  work_in_progress: boolean;
  merge_status: string;
  user_notes_count: number;
  web_url: string;
}
