import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
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
  write('.harness/project/config.json', JSON.stringify({ schema_version: 1, runners: { app: { image: 'node:22.19.0-alpine3.22' } }, checks: [{ id: 'test', scope: 'extensions', argv: ['test'], runner: 'app', timeout_seconds: 30, required: true, evidence: 'test result', applicability: 'all changes' }] }));
  assert.equal(checkRepository(root, { scope: 'extensions' }).ok, false);
  const config = fs.readFileSync(path.join(root, '.harness/project/config.json'));
  const report = { schema_version: 1, config_sha256: crypto.createHash('sha256').update(config).digest('hex'), checks: [{ id: 'test', exit_code: 0, executed_at: new Date().toISOString() }] };
  assert.equal(checkRepository(root, { scope: 'extensions', externalResults: report }).ok, true);
  report.config_sha256 = 'stale';
  assert.equal(checkRepository(root, { scope: 'extensions', externalResults: report }).ok, false);
  write('.harness/project/config.json', '{');
  assert.doesNotThrow(() => checkRepository(root, { scope: 'context' }));
  write('docs/domains/runtime/README.md', '# Runtime\n\n[Temporal][source]\n\n[source]: ../../../.harness_work/initiatives/example/brief.md\n');
  assert.equal(checkRepository(root, { scope: 'documentation' }).results.some(result => result.id === 'durable-reference' && result.status === 'failed'), true);
  write('.harness/project/config.json', config);
  const custom = JSON.parse(config);
  custom.checks[0].scope = 'code';
  write('.harness/project/config.json', JSON.stringify(custom));
  assert.equal(checkRepository(root, { scope: 'code' }).ok, false);
  write('.harness/project/config.json', config);
  assert.throws(() => checkRepository(root, { scope: 'unknown' }), /Scope desconocido/);
  fs.symlinkSync('/tmp', path.join(root, 'escape'));
  assert.throws(() => checkRepository(root), /symlinks/);
  console.log('Harness check tests passed.');
} finally {
  fs.rmSync(root, { recursive: true, force: true });
}
