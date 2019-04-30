# Merge Request Bot

## Install

Run `npm install` then `npm start`.

## Environment Variables

The bot uses some environment variables to access to Slack and Gitlab APIs.

You can either have them in your PATH or declare them inside a `.env` file in the root of the project directory (the `.env.example` can be used as a template).

### Slack

- `SLACK_TOKEN` : The OAuth bot token
- `SLACK_CHANNEL` : The channel to use for scheduled messages (ex. for a new Merge Request)

### Gitlab

- `GITLAB_URL` : The web url of your Gitlab instance
- `GITLAB_TOKEN` : The access token used for API access
- `GITLAB_PROJECT` : The list of Gitlab project ids you want to track (comma-separated)

### Other

- `PROXY` : The url of your proxy if necessary
- `NODE_TLS_REJECT_UNAUTHORIZED=0` : Add this if you have problems with SSL certificates.
