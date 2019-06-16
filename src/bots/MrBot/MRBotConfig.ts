import { GitlabProject } from 'src/models/gitlab/GitlabProject';

export interface MRBotSlackConfig {
  /**
   * Name of the bot user on slack
   */
  botName: string;

  /**
   * Bot OAuth token
   */
  botToken: string;

  /**
   * Slack channel id to use to post merge requests
   */
  channel: string;
}

export interface MRBotGitlabConfig {
  /**
   * Gitlab URL
   */
  url: string;

  /**
   * Gitlab Access Token
   */
  token: string;

  /**
   * List of gitlab projects to track
   */
  gitlabProjects: GitlabProject[];
}

export interface MRBotConfig {
  /**
   * Slack config
   */
  slack: MRBotSlackConfig;

  /**
   * Gitlab config
   */
  gitlab: MRBotGitlabConfig;

  /**
   * CRON schedule for hello message
   */
  cronSchedule?: string;
}
