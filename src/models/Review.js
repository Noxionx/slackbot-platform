export default class Review {
  constructor(data = {}) {
    this.projectId = data.projectId;
    this.iid = data.iid;
    this.user = data.user;
    this.createdAt = data.createdAt || new Date();
  }
}
