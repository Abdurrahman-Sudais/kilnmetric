import test from 'node:test';
import assert from 'node:assert/strict';
import site from '../src/content.js';
import {batches, model, reference, roles, windows} from '../src/data.js';
import {act, curve, initial, pattern, risk} from '../src/engine.js';

const ctx = {roles, actor: 'Test Engineer', windows};
const as = (s, role) => act(s, {type: 'role', role}, ctx).state;

test('risk is calibrated against inspected batches and ranks them in the right order', () => {
  const done = batches.filter((b) => b.inspected);
  const mae = done.reduce((s, b) => s + Math.abs(risk(b, model).p - b.inspected.rate), 0) / done.length;
  assert.ok(mae < 0.015, `mean absolute error ${mae}`);
  const worst = [...done].sort((a, b) => b.inspected.rate - a.inspected.rate)[0];
  const highest = [...done].sort((a, b) => risk(b, model).p - risk(a, model).p)[0];
  assert.equal(highest.id, worst.id);
});

test('every contribution is explained and a reference batch has none', () => {
  const ref = {...batches[0], peak: 1150, cool: 30, moisture: 5.5, clay: 'L-75'};
  assert.equal(risk(ref, model).parts.length, 0);
  const hot = risk(batches.find((b) => b.id === 'KB-309'), model);
  assert.ok(hot.parts.length >= 3 && hot.parts.every((p) => p.contribution > 0));
});

test('batch curves keep the reference shape, shifted by peak and stretched by cooling', () => {
  const c = curve({peak: 1160, cool: 30}, reference);
  assert.equal(c.length, reference.length);
  assert.equal(Math.max(...c.map(([, t]) => t)), 1160);
  const fast = curve({peak: 1150, cool: 36}, reference);
  assert.ok(fast[fast.length - 1][0] < reference[reference.length - 1][0], 'faster cooling ends sooner');
});

test('patterns compare inspected batches only', () => {
  const p = pattern(batches, 'L-77', (b) => b.clay === 'L-77');
  assert.equal(p.n[0] + p.n[1], batches.filter((b) => b.inspected).length);
  assert.ok(p.with > p.without);
});

test('engineers decide with reasons; trials stay in the window; inspectors record results', () => {
  let s = as(initial(batches, roles), 'operator');
  assert.equal(act(s, {type: 'decide', id: 'KB-309', decision: 'hold', reason: 'High risk from cooling'}, ctx).ok, false);
  s = as(s, 'engineer');
  assert.equal(act(s, {type: 'decide', id: 'KB-309', decision: 'hold', reason: 'short'}, ctx).ok, false);
  s = act(s, {type: 'decide', id: 'KB-309', decision: 'hold', reason: 'High risk from cooling'}, ctx).state;
  assert.equal(s.batches.find((b) => b.id === 'KB-309').status, 'hold');
  assert.equal(act(s, {type: 'plan', variable: 'cool', value: 40, reason: 'Slower cooling test'}, ctx).ok, false);
  assert.equal(act(s, {type: 'plan', variable: 'cool', value: 30, reason: 'Slower cooling test'}, ctx).ok, false);
  s = act(s, {type: 'plan', variable: 'cool', value: 27, reason: 'Slower cooling reduces cracks'}, ctx).state;
  assert.equal(act(s, {type: 'result', id: 'TR-01', control: 8.6, trial: 4.1}, ctx).ok, false);
  s = as(s, 'inspector');
  const r = act(s, {type: 'result', id: 'TR-01', control: 8.6, trial: 4.1}, ctx);
  assert.equal(r.ok, true); assert.equal(r.state.log.length, 3);
});

test('credits the founders', () => {
  assert.deepEqual(site.team.map((p) => [p.name, p.role]), [['Olumide Fashola', 'Founder/CEO'], ['Amina Bello', 'Co-founder']]);
});
