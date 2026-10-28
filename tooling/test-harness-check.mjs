import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
import { checkRepository } from './harness-check.mjs';

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'harness-check-'));
function write(file, content) {
  fs.mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
  fs.writeFileSync(path.join(root, file), content);
}
try {
  write('AGENTS.md', '# Router\n');
  write('docs/README.md', '# Contexto\n\n[Dominio](domains/billing.md#reglas)\n');
  write('docs/domains/billing.md', '# Facturación\n\n## Reglas\n\nLos importes conservan precisión.\n');
  assert.equal(checkRepository(root, { scope: 'documentation' }).ok, true);
  assert.equal(checkRepository(root, { scope: 'context' }).ok, true);
  write('docs/orphan.md', '# Fuente sin router\n');
  assert.equal(checkRepository(root, { scope: 'documentation' }).ok, false);
  fs.unlinkSync(path.join(root, 'docs/orphan.md'));
  write('.harness_work/initiatives/example/brief.md', '# Temporal\n');
  write('docs/domains/billing.md', '# Facturación\n\n## Reglas\n\n[Explicación](../../.harness_work/initiatives/example/brief.md)\n');
  assert.equal(checkRepository(root, { scope: 'documentation' }).ok, false);
  write('AGENTS.md', 'regla\n'.repeat(101));
  assert.equal(checkRepository(root, { scope: 'context' }).results.some(result => result.id === 'agents-lines' && result.status === 'failed'), true);
  write('.harness_work/initiatives/example/state.json', JSON.stringify({ schema_version: 1, id: 'example', revision: 1, status: 'closed', closed_at: '2026-01-01T00:00:00Z', retain_until: '2026-01-02T00:00:00Z' }));
  assert.equal(checkRepository(root, { scope: 'work' }).ok, false);
  write('.harness/project/config.json', JSON.stringify({ schema_version: 1, checks: [{ id: 'test', argv: ['test'], runner: 'app', timeout_seconds: 30, required: true }] }));
  assert.equal(checkRepository(root, { scope: 'extensions' }).ok, false);
  assert.throws(() => checkRepository(root, { scope: 'unknown' }), /Scope desconocido/);
  fs.symlinkSync('/tmp', path.join(root, 'escape'));
  assert.throws(() => checkRepository(root), /symlinks/);
  console.log('Harness check tests passed.');
} finally {
  fs.rmSync(root, { recursive: true, force: true });
}
