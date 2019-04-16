const MOCK = {
  id: 17672,
  iid: 590,
  project_id: 1456,
  title: 'ECLIV-12 (feature) : affichage du bloc et de la page infos UC',
  description: '',
  state: 'opened',
  created_at: '2019-04-12T16:11:16.686Z',
  updated_at: '2019-04-12T16:11:16.686Z',
  merged_by: null,
  merged_at: null,
  closed_by: null,
  closed_at: null,
  target_branch: 'develop',
  source_branch: 'feature/ECLIV-12',
  upvotes: 0,
  downvotes: 0,
  author: {
    id: 12,
    name: 'COCAULT Gaelle',
    username: 'GS5533',
    state: 'active',
    avatar_url: null,
    web_url: 'https://git.ra1.intra.groupama.fr/GS5533'
  },
  assignee: null,
  source_project_id: 1456,
  target_project_id: 1456,
  labels: [],
  work_in_progress: false,
  milestone: null,
  merge_when_pipeline_succeeds: false,
  merge_status: 'can_be_merged',
  sha: '98f01ad5d4cb19e60531c55d35dd045abf36282f',
  merge_commit_sha: null,
  user_notes_count: 0,
  discussion_locked: null,
  should_remove_source_branch: null,
  force_remove_source_branch: false,
  web_url:
    'https://git.ra1.intra.groupama.fr/ECLI/front-end/merge_requests/590',
  time_stats: {
    time_estimate: 0,
    total_time_spent: 0,
    human_time_estimate: null,
    human_total_time_spent: null
  },
  squash: false
};

export default class MergeRequest {
  constructor(data = MOCK) {
    this.id = data.id;
    this.iid = data.iid;
    this.project_id = data.project_id;
    this.title = data.title;
    this.description = data.description;
    this.state = data.state;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
    this.merged_by = data.merged_by;
    this.merged_at = data.merged_at;
    this.closed_by = data.closed_by;
    this.closed_at = data.closed_at;
    this.target_branch = data.target_branch;
    this.source_branch = data.source_branch;
    this.author = data.author;
    this.work_in_progress = data.work_in_progress;
    this.merge_status = data.merge_status;
    this.user_notes_count = data.user_notes_count;
    this.web_url = data.web_url;
  }
}
