import low from 'lowdb';
import FileSync from 'lowdb/adapters/FileSync';

export default class DBManager {
  constructor() {
    const adapter = new FileSync('db.json');
    this.db = low(adapter);

    // Set some defaults (required if your JSON file is empty)
    this.db.defaults({ reviews: [] }).write();
  }
}
