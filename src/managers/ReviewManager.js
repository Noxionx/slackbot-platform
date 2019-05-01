import MergeRequest from '../models/MergeRequest';

const TABLE = 'mergeRequests';

const REACTIONS = {
  startReview: ['eyes', 'eyeglasses'],
  finishReview: ['white_check_mark', 'heavy_check_mark'],
  note: ['warning', 'question', 'grey_question']
};

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
    setInterval(() => this.refresh(), 60 * 1000);

    // Add reaction listener
    this.slackManager.on('reaction', async ({ event }) => {
      await this.processReaction(event);
    });
  }

  async refresh() {
    const gitlabMergeRequests = await this.gitlabManager.fetchMergeRequests();
    const botMergeRequests = this.table.value();

    // Check current
    for (let oldMr of botMergeRequests) {
      for (let newMr of gitlabMergeRequests) {
        if (isSameMergeRequest(oldMr, newMr)) {
          await this.checkDiff(oldMr, newMr);
        }
      }
    }

    // :hankey: C'est pas du tout opti cette merde
    // Remove old
    const oldMergeRequests = botMergeRequests.filter(
      m => !gitlabMergeRequests.find(e => isSameMergeRequest(e, m))
    );
    oldMergeRequests.forEach(async mr => await this.removeMergeRequest(mr));

    // Add new
    const newMergeRequests = gitlabMergeRequests.filter(
      m => !botMergeRequests.find(e => isSameMergeRequest(e, m))
    );
    newMergeRequests.forEach(async mr => await this.newMergeRequest(mr));
  }

  newMergeRequest(mergeRequest) {
    this.removeMergeRequest(mergeRequest);
    const newMergeRequest = new MergeRequest(mergeRequest);
    this.slackManager.once('_botmsg', ({ event }) => {
      newMergeRequest.ts = event.ts;
      this.table.push(newMergeRequest).write();
    });
    this.slackManager.sendToMain(
      this.templateManager.mergeRequest(newMergeRequest)
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

  async processReaction(event) {
    if (!event.item) return;
    if (event.item.channel != this.slackManager.mainChannel) return;

    const mergeRequest = this.table.find({ ts: event.item.ts }).value();
    if (!mergeRequest) return;

    if (event.type == 'reaction_added') {
      if (isStartReviewReaction(event.reaction)) {
        await this.addReviewer(mergeRequest, event.user);
      }
      if (isFinishReviewReaction(event.reaction)) {
        await this.addValidator(mergeRequest, event.user);
      }
    }

    if (event.type == 'reaction_removed') {
      if (isStartReviewReaction(event.reaction)) {
        await this.removeReviewer(mergeRequest, event.user);
      }
      if (isFinishReviewReaction(event.reaction)) {
        await this.removeValidator(mergeRequest, event.user);
      }
    }
  }

  async addReviewer(mergeRequest, user) {
    const { project_id, iid } = mergeRequest;
    const reviewers = mergeRequest.reviewers || [];
    if (reviewers.indexOf(user) === -1) {
      mergeRequest.reviewers = [...reviewers, user];
      await this.updateMergeRequestMsg(mergeRequest);
      this.table
        .find({ project_id, iid })
        .assign(mergeRequest)
        .write();
    }
  }

  async removeReviewer(mergeRequest, user) {
    await this.removeValidator(mergeRequest, user);
    const { project_id, iid } = mergeRequest;
    const reviewers = mergeRequest.reviewers || [];
    if (reviewers.indexOf(user) !== -1) {
      mergeRequest.reviewers = reviewers.filter(r => r != user);
      await this.updateMergeRequestMsg(mergeRequest);
      this.table
        .find({ project_id, iid })
        .assign(mergeRequest)
        .write();
    }
  }

  async addValidator(mergeRequest, user) {
    const { project_id, iid } = mergeRequest;
    const reviewers = mergeRequest.reviewers || [];
    const validators = mergeRequest.validators || [];
    if (reviewers.indexOf(user) !== -1 && validators.indexOf(user) === -1) {
      mergeRequest.validators = [...validators, user];
      await this.updateMergeRequestMsg(mergeRequest);
      this.table
        .find({ project_id, iid })
        .assign(mergeRequest)
        .write();
    }
  }

  async removeValidator(mergeRequest, user) {
    const { project_id, iid } = mergeRequest;
    const validators = mergeRequest.validators || [];
    if (validators.indexOf(user) !== -1) {
      mergeRequest.validators = validators.filter(r => r != user);
      await this.updateMergeRequestMsg(mergeRequest);
      this.table
        .find({ project_id, iid })
        .assign(mergeRequest)
        .write();
    }
  }

  async updateMergeRequestMsg(mergeRequest) {
    await this.slackManager.updateFromMain(
      mergeRequest.ts,
      this.templateManager.mergeRequest(new MergeRequest(mergeRequest))
    );
  }

  async checkDiff(oldMr, newMr) {
    if (oldMr.hasUnresolvedNotes !== newMr.hasUnresolvedNotes) {
      const newMergeRequest = new MergeRequest({ ...oldMr, ...newMr });
      const { project_id, iid } = newMergeRequest;
      await this.updateMergeRequestMsg(newMergeRequest);
      this.table
        .find({ project_id, iid })
        .assign(newMergeRequest)
        .write();
    }
  }
}

function isStartReviewReaction(reaction) {
  return REACTIONS.startReview.indexOf(reaction) !== -1;
}

function isFinishReviewReaction(reaction) {
  return REACTIONS.finishReview.indexOf(reaction) !== -1;
}

function isSameMergeRequest(oldMr, newMr) {
  return oldMr.project_id == newMr.project_id && oldMr.iid == newMr.iid;
}
