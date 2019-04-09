import * as actions from './actions';

export class Engine {
  constructor(slackEvents) {
    this.slackEvents = slackEvents;
    this.init();
  }

  async init() {
    // Put Handlers / Actions here
    console.log(await actions.test());
  }
}
