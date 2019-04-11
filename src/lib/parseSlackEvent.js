// The ONLY purpose of this lib (instead of @slack/events-api) is to parse interaction based events :/
// I don"t want to explain but if you want to reproduce : just grab the official lib, send an interactive message whit a button.
// Everything should work normally. Then click on the button, and now, when you server catch the response... FUCK !!
// And the official lib (ATM => 11/04/2019) is about to be migrated under 'node-slack-sdk' repository
// THATS GREAT (i'm sad) ! So just wait and....
// #FIXME :3
import getRawBody from 'raw-body';

export async function parseSlackEvent(req) {
  return getRawBody(req)
    .then(buffer => buffer.toString())
    .then(body => {
      const payload =
        body.indexOf('payload=') === 0
          ? decodeURIComponent(body.slice(8))
          : body;
      return JSON.parse(payload);
    });
}
// FUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUCKKKKKKKKKKKK MEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE !!!!!!!!!!!!!!
