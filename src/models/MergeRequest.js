import Review from './Review';

export default class MergeRequest {
  constructor(data = {}) {
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

    // Custom fields
    this.project_name = data.project_name;

    // Slack Info
    this.ts = data.ts;

    // Review Info (bof bof)
    this.reviews = (data.reviews || []).map(r => new Review(r));
  }
}
