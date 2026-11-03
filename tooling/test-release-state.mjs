import assert from 'node:assert/strict';
import {isInitialDraft} from './release-state.mjs';
assert.equal(isInitialDraft('0.1.0','unreleased'),true);
assert.equal(isInitialDraft('0.1.0','released'),false);
assert.equal(isInitialDraft('1.0.0','unreleased'),false);
assert.equal(isInitialDraft('4.0.0','released'),false);
for(const status of ['', 'draft', 'unknown'])assert.throws(()=>isInitialDraft('0.1.0',status));
assert.throws(()=>isInitialDraft('00.1.0','unreleased'));
console.log('Release state passed: only initial unreleased targets exempt version bumps; released/stable versions and invalid states retain protections.');
