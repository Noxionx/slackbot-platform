export default class Group {
  constructor(data = {}) {
    this.id = data.id;
    this.name = data.name;
    this.description = data.description;
    this.web_url = data.web_url;
  }
}
