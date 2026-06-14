import initSqlJs from 'sql.js';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { dirname } from 'path';
import { config } from '../config.js';
let SQL = null;
let _db = null;
class CS {
    stmt;
    db;
    constructor(d, s) { this.db = d; this.stmt = d.prepare(s); }
    all(...p) { const r = []; if (p.length)
        this.stmt.bind(p); while (this.stmt.step())
        r.push(this.stmt.getAsObject()); this.stmt.free(); return r; }
    get(...p) { if (p.length)
        this.stmt.bind(p); const ok = this.stmt.step(); const r = ok ? this.stmt.getAsObject() : undefined; this.stmt.free(); return r; }
    run(...p) { if (p.length)
        this.stmt.bind(p); this.stmt.step(); this.stmt.free(); const changes = this.db.getRowsModified(); const lastId = this.db.exec('SELECT last_insert_rowid()')?.[0]?.values?.[0]?.[0] ?? 0; return { changes, lastInsertRowid: lastId }; }
}
class CD {
    db;
    fp;
    constructor(d, f) { this.db = d; this.fp = f; }
    prepare(s) { return new CS(this.db, s); }
    exec(s) { this.db.run(s); }
    transaction(fn) { this.db.run('BEGIN'); try {
        fn();
        this.db.run('COMMIT');
    }
    catch (e) {
        this.db.run('ROLLBACK');
        throw e;
    } }
    pragma(s) { this.db.run('PRAGMA ' + s); }
    close() { try {
        const d = this.db.export();
        mkdirSync(dirname(this.fp), { recursive: true });
        writeFileSync(this.fp, Buffer.from(d));
    }
    catch { } ; this.db.close(); }
}
export function getDb() { if (!_db)
    throw new Error('DB not init'); return _db; }
export async function initDb() { if (!SQL)
    SQL = await initSqlJs(); mkdirSync(dirname(config.databasePath), { recursive: true }); const d = existsSync(config.databasePath) ? new SQL.Database(readFileSync(config.databasePath)) : new SQL.Database(); d.run('PRAGMA journal_mode=WAL'); d.run('PRAGMA busy_timeout=5000'); d.run('PRAGMA foreign_keys=ON'); _db = new CD(d, config.databasePath); return _db; }
export function closeDb() { if (_db) {
    _db.close();
    _db = null;
} }
//# sourceMappingURL=connection.js.map