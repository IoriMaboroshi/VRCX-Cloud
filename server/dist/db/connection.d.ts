import { Database as SDb } from 'sql.js';
declare class CS {
    stmt: any;
    db: SDb;
    constructor(d: SDb, s: string);
    all(...p: any[]): any[];
    get(...p: any[]): any;
    run(...p: any[]): {
        changes: any;
        lastInsertRowid: string | number | Uint8Array<ArrayBufferLike>;
    };
}
declare class CD {
    db: SDb;
    fp: string;
    constructor(d: SDb, f: string);
    prepare(s: string): CS;
    exec(s: string): void;
    transaction(fn: () => void): void;
    pragma(s: string): void;
    close(): void;
}
export declare function getDb(): CD;
export declare function initDb(): Promise<CD>;
export declare function closeDb(): void;
export {};
//# sourceMappingURL=connection.d.ts.map