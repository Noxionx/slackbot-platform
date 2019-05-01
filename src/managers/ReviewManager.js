import MergeRequest from '../models/MergeRequest';

const TABLE = 'mergeRequests';

export default class ReviewManager {
  constructor({ gitlabManager, slackManager, templateManager, dbManager }) {
    this.gitlabManager = gitlabManager;
    this.slackManager = slackManager;
    this.templateManager = templateManager;
    this.dbManager = dbManager;

    this.table = this.dbManager.db.get(TABLE);
  }

  async init() {
    await this.refresh();

    // Add reaction listener
    this.slackManager.on('reaction', ({ event }) => {
      this.processReaction(event);
    });
  }

  async refresh() {
    const gitlabMergeRequests = await this.gitlabManager.fetchMergeRequests();
    const botMergeRequests = this.table.value();

    // :hankey: C'est pas du tout opti cette merde
    // Remove old
    const oldMergeRequests = botMergeRequests.filter(
      m =>
        !gitlabMergeRequests.find(
          e => e.project_id == m.project_id && e.iid == m.iid
        )
    );
    oldMergeRequests.forEach(mr => this.removeMergeRequest(mr));

    // Add new
    const newMergeRequests = gitlabMergeRequests.filter(
      m =>
        !botMergeRequests.find(
          e => e.project_id == m.project_id && e.iid == m.iid
        )
    );
    newMergeRequests.forEach(mr => this.newMergeRequest(mr));
  }

  newMergeRequest(mergeRequest) {
    this.removeMergeRequest(mergeRequest);
    this.slackManager.once('_botmsg', ({ event }) => {
      this.table
        .push(new MergeRequest({ ...mergeRequest, ts: event.ts }))
        .write();
    });
    this.slackManager.sendToMain(
      this.templateManager.mergeRequest(mergeRequest)
    );
  }

  removeMergeRequest(mergeRequest) {
    const { project_id, iid } = mergeRequest;
    const entry = this.table.find({ project_id, iid }).value();
    if (entry) {
      if (entry.ts) {
        this.slackManager.removeFromMain(entry.ts);
      }
      this.table.remove({ project_id, iid }).write();
    }
  }

  processReaction(event) {
    if (event.item) return;
    if (event.item.channel != this.slackManager.mainChannel) return;

    const mergeRequest = this.table.find({ ts: event.item.ts }).value();
    if (!mergeRequest) return;

    // TODO !!
  }
}
