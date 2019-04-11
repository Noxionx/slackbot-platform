import * as actions from './actions';
import { runBlockActionEvent, runEventCallbackEvent } from './handlers';
import { parseSlackEvent } from './lib/parseSlackEvent';

export class Engine {
  constructor() {
    this.init();
  }

  async init() {
    const tmp = await actions.fetchUsers();
    this.users = [...tmp].filter(u => !u.deleted);
  }

  async runHandler(req, res) {
    const body = await parseSlackEvent(req);
    switch (body.type) {
    case 'url_verification':
      res.send(body.challenge);
      break;
    case 'event_callback':
      await runEventCallbackEvent(body);
      break;
    case 'block_actions':
      await runBlockActionEvent(body);
      break;
    default:
      console.log('Unknown action');
    }
  }

  getMiddleware() {
    return this.runHandler;
  }
}
