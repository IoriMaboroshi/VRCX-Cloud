import initSqlJs, { Database as SDb } from 'sql.js';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { dirname } from 'path';
import { config } from '../config.js';
let SQL: any = null; let _db: any = null;
class CS { stmt: any; constructor(d: SDb, s: string) { this.stmt = d.prepare(s); }
  all(...p: any[]) { const r: any[] = []; if(p.length)this.stmt.bind(p as any); while(this.stmt.step())r.push(this.stmt.getAsObject()); this.stmt.free(); return r; }
  get(...p: any[]) { if(p.length)this.stmt.bind(p as any); const ok = this.stmt.step(); const r = ok ? this.stmt.getAsObject() : undefined; this.stmt.free(); return r; }
  run(...p: any[]) { if(p.length)this.stmt.bind(p as any); this.stmt.step(); this.stmt.free(); return {changes:1, lastInsertRowid:0}; } }
class CD { db: SDb; fp: string; constructor(d: SDb, f: string) { this.db = d; this.fp = f; }
  prepare(s: string): CS { return new CS(this.db, s); }
  exec(s: string): void { this.db.run(s); }
  transaction(fn: () => void): void { this.db.run('BEGIN'); try{fn();this.db.run('COMMIT')}catch(e){this.db.run('ROLLBACK');throw e} }
  pragma(s: string): void { this.db.run('PRAGMA '+s); }
  close(): void { try{const d=this.db.export();mkdirSync(dirname(this.fp),{recursive:true});writeFileSync(this.fp,Buffer.from(d))}catch{}; this.db.close(); } }
export function getDb(): CD { if(!_db)throw new Error('DB not init'); return _db; }
export async function initDb(): Promise<CD> { if(!SQL)SQL=await initSqlJs(); mkdirSync(dirname(config.databasePath),{recursive:true}); const d: SDb = existsSync(config.databasePath)?new SQL.Database(readFileSync(config.databasePath)):new SQL.Database(); d.run('PRAGMA journal_mode=WAL');d.run('PRAGMA busy_timeout=5000');d.run('PRAGMA foreign_keys=ON');_db=new CD(d,config.databasePath);return _db; }
export function closeDb(): void { if(_db){_db.close();_db=null;} }
