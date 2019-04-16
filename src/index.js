import 'dotenv/config';
import { Engine } from './Engine';

// Create bot Engine
const engine = new Engine();

// INIT
engine.init().catch(console.error);
