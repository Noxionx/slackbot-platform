import cron from 'node-cron';

import GitlabService from '../../services/GitlabService';
import DBService from '../../services/DBService';

import { SlackMessage, SlackBotMessage } from '../../models/slack/SlackEvent';
import { GitlabMergeRequest } from '../../models/gitlab/GitlabMergeRequest';
import { GitlabProject } from '../../models/gitlab/GitlabProject';

import SlackBot from '../SlackBot';

import { MergeRequest } from './MergeRequest';
import TemplateManager from './TemplateManager';
import { MRBotConfig } from './MRBotConfig';

const TABLE_NAME = 'mergeRequests';

export default class MRBot extends SlackBot {
  private config: MRBotConfig;

  private gitlabService: GitlabService;
  private dbService: DBService;

  constructor(config: MRBotConfig) {
    super(config.slack.botName, config.slack.botToken);

    if (!config.gitlab.gitlabProjects || !config.gitlab.gitlabProjects.length) {
      throw new Error('Missing gitlab project');
    }

    this.config = config;
  }

  // PUBLIC METHODS

  async start() {
    // Init slack bot
    await this.init();

    // Create Gitlab Service
    const { url, token } = this.config.gitlab;
    this.gitlabService = new GitlabService({ url, token });

    // Create DB Service
    this.dbService = new DBService([TABLE_NAME]);

    // Start refresh loop
    await this.refresh();
    setInterval(() => this.refresh(), 60 * 1000);

    // Set cron schedule
    if (this.config.cronSchedule) {
      cron.schedule(this.config.cronSchedule, () => this.hello());
    }
  }

  // IMPLEMENTED METHODS

  onUserMessage(event: SlackMessage): void {}

  onBotMessage(event: SlackBotMessage): void {}

  onCommand(
    cmd: string,
    args: any[],
    user: string,
    channel: string,
    ts: string,
  ): void {
    let msg = null;
    if (cmd === 'man') {
      msg = TemplateManager.man();
    }
    if (cmd === 'info') {
      msg = TemplateManager.info();
    }

    if (msg) {
      this.sendUserMessage(user, msg);
    }
  }

  onAddReaction(
    reaction: string,
    user: string,
    channel: string,
    ts: string,
  ): void {
    // If the reaction is on the tracked channel
    if (channel === this.config.slack.channel) {
      // Search for the associated merge request in DB with the message ID
      const mergeRequest = this.dbService.search<MergeRequest>(TABLE_NAME, {
        ts,
      });
      if (mergeRequest) {
        // Start review reactions
        if (reaction === 'eyes' || reaction === 'eyeglasses') {
          this.addReviewer(mergeRequest, user);
        }
        // Finish review reactions
        if (
          reaction === 'white_check_mark' ||
          reaction === 'heavy_check_mark'
        ) {
          this.addValidator(mergeRequest, user);
        }
      }
    }
  }

  onRemoveReaction(
    reaction: string,
    user: string,
    channel: string,
    ts: string,
  ): void {
    // If the reaction is on the tracked channel
    if (channel === this.config.slack.channel) {
      // Search for the associated merge request in DB with the message ID
      const mergeRequest = this.dbService.search<MergeRequest>(TABLE_NAME, {
        ts,
      });
      if (mergeRequest) {
        // Start review reactions
        if (reaction === 'eyes' || reaction === 'eyeglasses') {
          this.removeReviewer(mergeRequest, user);
        }
        // Finish review reactions
        if (
          reaction === 'white_check_mark' ||
          reaction === 'heavy_check_mark'
        ) {
          this.removeValidator(mergeRequest, user);
        }
      }
    }
  }

  // PRIVATE METHODS

  /**
   * Main refresh loop
   */
  private async refresh() {
    // For all tracked projects
    for (const project of this.config.gitlab.gitlabProjects) {
      // Fetch all opened merge requests (no WIP)
      const mergeRequests = await this.gitlabService.getOpenedMergeRequests(
        project.id,
      );

      // Clean finished Merge Requests
      const dbMergeRequests = this.getAllDBMergeRequest();
      for (const dbMR of dbMergeRequests) {
        const mr = mergeRequests.find(
          m => m.iid === dbMR.iid && m.project_id === dbMR.project_id,
        );
        if (!mr) {
          dbMR.state = 'merged';
          await this.updateMergeRequest(dbMR);
        }
      }

      // Add or update existing Merge Requests
      for (const mr of mergeRequests) {
        // Search the merge request in DB
        const dbMR = this.getDBMergeRequest(mr);
        if (!dbMR) {
          // If no message has been posted, create the merge request message and save it
          await this.newMergeRequest(project, mr);
        } else {
          // Check if the merge request has unresolved notes
          const hasNotes = await this.gitlabService.hasUnresolvedNotes(mr);
          // If diff, update
          if (dbMR.hasNotes !== hasNotes) {
            await this.updateMergeRequest({ ...dbMR, hasNotes });
          }
        }
      }
    }
  }

  private async hello() {
    const dbMergeRequests = this.getAllDBMergeRequest();
    if (dbMergeRequests.length) {
      this.sendMessage(
        this.config.slack.channel,
        TemplateManager.hello(dbMergeRequests),
      );
    }
  }

  private async newMergeRequest(
    project: GitlabProject,
    mergeRequest: GitlabMergeRequest,
  ) {
    // Create the merge request object from GitlabMergeRequest
    const dbMR: MergeRequest = {
      ...mergeRequest,
      projectName: project.name,
      hasNotes: await this.gitlabService.hasUnresolvedNotes(mergeRequest),
      reviewers: [],
      validators: [],
      ts: null,
      link: null,
    };
    // Send the slack message
    const rep = await this.sendMessage(
      this.config.slack.channel,
      TemplateManager.mergeRequest(dbMR),
    );

    // Add the message id the the merge request object
    dbMR.ts = rep.ts;

    // Get the permalink of the message
    dbMR.link = await this.getMessageLink(this.config.slack.channel, dbMR.ts);

    // Save merge request object
    this.dbService.saveOrUpdate(TABLE_NAME, dbMR);
  }

  private async updateMergeRequest(mergeRequest: MergeRequest): Promise<void> {
    // Update slack message
    this.updateMessage(
      this.config.slack.channel,
      mergeRequest.ts,
      TemplateManager.mergeRequest(mergeRequest),
    );

    if (mergeRequest.state === 'opened') {
      // Save updated merge request
      this.dbService.saveOrUpdate(TABLE_NAME, mergeRequest, [
        'project_id',
        'iid',
      ]);
    } else {
      const { iid, project_id } = mergeRequest;
      this.dbService.remove(TABLE_NAME, { iid, project_id });
    }
  }

  private async addReviewer(mergeRequest: MergeRequest, user: string) {
    const reviewers = mergeRequest.reviewers || [];
    if (reviewers.indexOf(user) === -1) {
      mergeRequest.reviewers = [...reviewers, user];
      await this.updateMergeRequest(mergeRequest);
    }
  }

  private async removeReviewer(mergeRequest: MergeRequest, user: string) {
    await this.removeValidator(mergeRequest, user);
    const reviewers = mergeRequest.reviewers || [];
    if (reviewers.indexOf(user) !== -1) {
      mergeRequest.reviewers = reviewers.filter(r => r !== user);
      await this.updateMergeRequest(mergeRequest);
    }
  }

  private async addValidator(mergeRequest: MergeRequest, user: string) {
    const reviewers = mergeRequest.reviewers || [];
    const validators = mergeRequest.validators || [];
    if (reviewers.indexOf(user) !== -1 && validators.indexOf(user) === -1) {
      mergeRequest.validators = [...validators, user];
      await this.updateMergeRequest(mergeRequest);
    }
  }

  private async removeValidator(mergeRequest: MergeRequest, user: string) {
    const validators = mergeRequest.validators || [];
    if (validators.indexOf(user) !== -1) {
      mergeRequest.validators = validators.filter(r => r !== user);
      await this.updateMergeRequest(mergeRequest);
    }
  }

  private getDBMergeRequest(mergeRequest: GitlabMergeRequest): MergeRequest {
    const { project_id, iid } = mergeRequest;
    return this.dbService.search<MergeRequest>(TABLE_NAME, {
      project_id,
      iid,
    });
  }

  private getAllDBMergeRequest(): MergeRequest[] {
    return this.dbService.all<MergeRequest>(TABLE_NAME);
  }
}
