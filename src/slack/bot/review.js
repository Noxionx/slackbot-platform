import WebClient from '../webClient';
import db from '../../db';
import Review from '../../models/Review';

import { reviewForMe } from '../templates/review';

import { imFor } from '../api';

export async function review({ event, mergeRequests = [], projects = {} }) {
  const RE = /review (\d+)/g;
  const iid = RE.exec(event.text)[1];
  if (!iid) {
    throw 'Missing merge request iid !';
  }
  const mergeRequest = mergeRequests.find(mr => mr.iid == iid);
  if (!mergeRequest) {
    throw 'Merge request not found';
  }
  const entry = db
    .get('reviews')
    .find({ projectId: mergeRequest.project_id, iid, user: event.user })
    .value();
  if (!entry) {
    db.get('reviews')
      .push(
        new Review({
          projectId: mergeRequest.project_id,
          iid,
          user: event.user
        })
      )
      .write();
  } else {
    db.get('reviews')
      .remove({ projectId: mergeRequest.project_id, iid, user: event.user })
      .write();
  }
  await WebClient.chat.postMessage({
    blocks: reviewForMe({
      mergeRequest,
      project: projects[mergeRequest.project_id],
      remove: !!entry
    }),
    channel: await imFor(event.user)
  });
}
