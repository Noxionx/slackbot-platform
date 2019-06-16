declare module 'lowdb/adapters/Base' {
  export default class Base {
    constructor(
      source: string,
      {
        defaultValue,
        serialize,
        deserialize,
      }?: {
        defaultValue: any;
        serialize: (data: any) => string;
        deserialize: (strData: string) => any;
      },
    );
  }
}

declare module 'lowdb/adapters/FileSync' {
  import Base from 'lowdb/adapters/Base';
  export default class FileSync extends Base {
    read(): any;
    write(data: any): void;
  }
}

declare module 'lowdb' {
  import Base from 'lowdb/adapters/Base';

  class DB {
    defaults(initObj: any);
    get(table: string): DB;
    find(args: any): DB;
    remove(args: any): DB;
    assign(data: any): DB;
    push(data: any): DB;
    value(): any;
    write(): void;
  }

  export default function(adatapter: Base): DB;
}
