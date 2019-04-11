import 'dotenv/config';
import express from 'express';
import { Engine } from './Engine';

/**
 * INIT
 */
const app = express();

/**
 * Bot Engine
 */
const engine = new Engine();

/**
 * MIDDLEWARES
 */
app.use('/', engine.getMiddleware());

/**
 * START
 */
app.listen(3001, function() {
  console.log('Started !');
});
