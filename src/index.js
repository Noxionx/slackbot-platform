import 'dotenv/config';
import express from 'express';
import { createEventAdapter } from '@slack/events-api';
import { Engine } from './Engine';

/**
 * INIT
 */
const app = express();
const slackEvents = createEventAdapter(process.env.SLACK_SIGNING_SECRET);

/**
 * MIDDLEWARES
 */
app.use('/', slackEvents.expressMiddleware());

/**
 * APP
 */
new Engine(slackEvents);

/**
 * START
 */
app.listen(3001, function() {
  console.log('Started !');
});
