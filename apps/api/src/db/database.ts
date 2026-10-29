import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { MIGRATIONS } from './migrations.js';

/**
 * Acesso à base de dados (DT-021). O motor é SQLite, pela biblioteca `node:sqlite` que vem com
 * o Node 24 — sem dependência nova e sem servidor a instalar. **Isto é uma escolha de
 * desenvolvimento, não de produção:** a DT-021 regista PostgreSQL como destino, e é por isso
 * que o resto do código fala com os repositórios e nunca com este módulo diretamente.
 */
export type Database = DatabaseSync;

export interface OpenOptions {
  /** Caminho do ficheiro, ou `:memory:` nos testes. */
  readonly file: string;
}

export function openDatabase({ file }: OpenOptions): Database {
  ensureDirectory(file);
  const db = new DatabaseSync(file);
  // Sem isto o SQLite ignora as chaves estrangeiras declaradas nas migrações.
  db.exec('pragma foreign_keys = on');
  // Escrita e leitura deixam de se bloquear uma à outra.
  db.exec('pragma journal_mode = wal');
  // Espera em vez de falhar quando outra ligação está a escrever.
  db.exec('pragma busy_timeout = 5000');
  migrate(db);
  return db;
}

/**
 * Cria a pasta do ficheiro, se faltar. Sem isto o SQLite morre com `unable to open database file`,
 * que não diz a quem lê que falta uma pasta. Pedido A-R11 do `frontend`.
 */
function ensureDirectory(file: string): void {
  if (file === ':memory:' || file === '') return;
  const pasta = dirname(file);
  if (pasta === '' || pasta === '.') return;
  try {
    mkdirSync(pasta, { recursive: true });
  } catch (error) {
    throw new Error(`Não foi possível criar a pasta da base de dados (${pasta}): ${(error as Error).message}`, { cause: error });
  }
}

/** Aplica as migrações em falta, cada uma numa transação. Já aplicada, nunca volta a correr. */
export function migrate(db: Database): readonly number[] {
  db.exec('create table if not exists schema_migrations (version integer primary key, name text not null, applied_at text not null)');

  const applied = new Set(
    db.prepare('select version from schema_migrations').all().map((row) => Number(row['version'])),
  );
  const record = db.prepare('insert into schema_migrations (version, name, applied_at) values (?, ?, ?)');
  const done: number[] = [];

  for (const migration of MIGRATIONS) {
    if (applied.has(migration.version)) continue;
    db.exec('begin');
    try {
      db.exec(migration.sql);
      record.run(migration.version, migration.name, new Date().toISOString());
      db.exec('commit');
    } catch (error) {
      db.exec('rollback');
      throw new Error(`Migração ${migration.version} (${migration.name}) falhou: ${(error as Error).message}`, { cause: error });
    }
    done.push(migration.version);
  }

  return done;
}

/**
 * Corre `work` numa transação. O SQLite do `node:sqlite` é síncrono, por isso não há aqui
 * `await` nenhum: a transação abre e fecha sem dar a vez a outro pedido.
 */
export function inTransaction<T>(db: Database, work: () => T): T {
  db.exec('begin immediate');
  try {
    const result = work();
    db.exec('commit');
    return result;
  } catch (error) {
    db.exec('rollback');
    throw error;
  }
}
