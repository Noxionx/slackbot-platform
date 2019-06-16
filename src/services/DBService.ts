import low, { DB } from 'lowdb';
import FileSync from 'lowdb/adapters/FileSync';

export default class DBService {
  private db: DB;

  constructor(tables = [], filename = 'db.json') {
    const adapter = new FileSync(filename);
    this.db = low(adapter);
    const initObj = {};
    tables.forEach(table => (initObj[table] = []));
    this.db.defaults(initObj).write();
  }

  /**
   * Get all elements from a table
   * @param table Table name
   */
  all<T>(table: string) {
    return this.db.get(table).value() as T[];
  }

  /**
   * Search a specific element in a table
   * @param table Table name
   * @param args Search arguments
   */
  search<T>(table: string, args: any) {
    return this.db
      .get(table)
      .find(args)
      .value() as T;
  }

  /**
   * Find element by ID
   * @param table Table name
   * @param id Element ID
   */
  findById<T>(table: string, id: number | string) {
    return this.search<T>(table, { id });
  }

  /**
   * Find element by name
   * @param table Table name
   * @param name Element name
   */
  findByName<T>(table: string, name: string) {
    return this.search<T>(table, { name });
  }

  /**
   * Add or update element
   * @param table Table name
   * @param data Element data
   * @param keys List of keys to search existing element
   */
  saveOrUpdate(table: string, data: any, keys?: string[]) {
    if (!data.id && !keys) {
      throw new Error('missign id');
    }
    let search: any = {};
    search.id = data.id;
    if (keys) {
      search = {};
      keys.forEach(key => (search[key] = data[key]));
    }
    const oldData = this.search(table, search);
    if (!oldData) {
      this.db
        .get(table)
        .push(data)
        .write();
    } else {
      this.db
        .get(table)
        .find(search)
        .assign(data)
        .write();
    }
  }

  /**
   * Remove element from table
   * @param table Table name
   * @param id Element ID
   */
  remove(table: string, id: number | string) {
    this.db
      .get(table)
      .remove({ id })
      .write();
  }
}
