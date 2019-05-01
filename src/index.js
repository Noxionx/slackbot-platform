import 'dotenv/config';
import { Engine } from './Engine';

// Create bot Engine
const engine = new Engine();

// INIT
engine
  .init()
  .then(console.log)
  .catch(console.error);
