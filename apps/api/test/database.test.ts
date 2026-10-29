import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { type Database, openDatabase } from '../src/db/database.js';

// A-R11: a pasta da base de dados é criada na abertura. Sem isto o SQLite morria com
// `unable to open database file`, que não diz a quem lê que falta uma pasta.

let aberta: Database | undefined;
let raiz: string | undefined;

afterEach(() => {
  aberta?.close();
  aberta = undefined;
  if (raiz) rmSync(raiz, { recursive: true, force: true });
  raiz = undefined;
});

describe('openDatabase (A-R11)', () => {
  it('cria a pasta que falta, incluindo níveis intermédios', () => {
    raiz = mkdtempSync(join(tmpdir(), 'blbet-db-'));
    const ficheiro = join(raiz, 'data', 'interno', 'blbet.db');
    expect(existsSync(join(raiz, 'data'))).toBe(false);

    aberta = openDatabase({ file: ficheiro });

    expect(existsSync(ficheiro)).toBe(true);
    // A base abre utilizável: as migrações correram dentro dela.
    const versoes = aberta.prepare('select version from schema_migrations').all();
    expect(versoes.length).toBeGreaterThan(0);
  });

  it('reabre uma base já existente sem perder o que lá está', () => {
    raiz = mkdtempSync(join(tmpdir(), 'blbet-db-'));
    const ficheiro = join(raiz, 'data', 'blbet.db');

    const primeira = openDatabase({ file: ficheiro });
    const antes = primeira.prepare('select count(*) as total from schema_migrations').get();
    primeira.close();

    aberta = openDatabase({ file: ficheiro });
    const depois = aberta.prepare('select count(*) as total from schema_migrations').get();
    expect(depois?.['total']).toBe(antes?.['total']);
  });

  it('não tenta criar pasta nenhuma para a base em memória', () => {
    aberta = openDatabase({ file: ':memory:' });
    expect(aberta.prepare('select version from schema_migrations').all().length).toBeGreaterThan(0);
  });
});
