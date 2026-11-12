// Firing ledger rules: an explainable defect-risk model, batch curves from the reference, patterns grouped from
// inspected batches, trials kept inside approved windows, and decisions recorded by engineers.

export const can = (roles, roleId, perm) => !!roles.find((r) => r.id === roleId)?.can.includes(perm);

/** Defect risk and the contribution of each feature to the log-odds. */
export function risk(batch, model) {
  const parts = model.features.map((f) => ({key: f.key, label: f.label, value: f.value(batch), contribution: f.weight * f.value(batch)}));
  const z = model.intercept + parts.reduce((s, p) => s + p.contribution, 0);
  return {p: 1 / (1 + Math.exp(-z)), parts: parts.filter((p) => p.contribution > 0).sort((a, b) => b.contribution - a.contribution)};
}

/** A batch's firing curve: the reference, shifted to its peak, with cooling stretched or squeezed by its cooling rate. */
export function curve(batch, reference, refCool = 30) {
  const peakShift = batch.peak - 1150;
  const coolFactor = refCool / batch.cool;
  return reference.map(([t, c], i) => {
    if (i <= 6) return [t, c >= 1100 ? c + peakShift : c];
    return [40 + (t - 40) * coolFactor, c];
  });
}

/** Rejection rate grouped by a condition, from batches that have been inspected. */
export function pattern(batches, label, test) {
  const done = batches.filter((b) => b.inspected);
  const yes = done.filter(test), no = done.filter((b) => !test(b));
  const avg = (xs) => (xs.length ? xs.reduce((s, b) => s + b.inspected.rate, 0) / xs.length : null);
  return {label, with: avg(yes), without: avg(no), n: [yes.length, no.length]};
}

export function initial(batches, roles) {
  return {batches: structuredClone(batches), trials: [], log: [], role: roles[0].id};
}

const now = () => new Date().toISOString();

export function act(state, a, {roles, actor, windows}) {
  const fail = (error) => ({state, ok: false, error});
  if (a.type === 'role') return {state: {...state, role: a.role}, ok: true};
  const allow = (p) => can(roles, state.role, p);
  const reason = (a.reason || '').trim();
  const log = (id, summary, patch) => ({ok: true, state: {...state, ...patch, log: [{at: now(), actor, role: state.role, id, summary}, ...state.log]}});

  if (a.type === 'plan') {
    if (!allow('plan')) return fail('Only process engineers or the plant manager approve trials.');
    const w = windows[a.variable];
    if (!w) return fail('Trials can vary peak temperature or cooling rate.');
    const v = Number(a.value);
    if (!Number.isFinite(v) || v < w.range[0] || v > w.range[1]) return fail(`Stay inside the approved window of ${w.range[0]}–${w.range[1]} ${w.unit}.`);
    if (v === w.ref) return fail('A trial needs a setting different from the current reference.');
    if (reason.length < 8) return fail('State the hypothesis being tested (at least 8 characters).');
    const id = `TR-${String(state.trials.length + 1).padStart(2, '0')}`;
    return log(id, `Approved trial ${id}: ${w.label} ${v} ${w.unit} vs ${w.ref} ${w.unit} — “${reason}”`, {trials: [...state.trials, {id, variable: a.variable, value: v, reason, by: actor, result: null}]});
  }
  if (a.type === 'result') {
    if (!allow('result')) return fail('Inspection results are recorded by quality inspectors.');
    const t = state.trials.find((x) => x.id === a.id);
    if (!t) return fail('Trial not found.');
    const c = Number(a.control), r = Number(a.trial);
    if (![c, r].every((x) => Number.isFinite(x) && x >= 0 && x <= 100)) return fail('Enter rejection rates between 0 and 100%.');
    return log(t.id, `Recorded ${t.id} result: control ${c}% · trial ${r}% rejected`, {trials: state.trials.map((x) => (x.id === t.id ? {...x, result: {control: c, trial: r, by: actor}} : x))});
  }

  const b = state.batches.find((x) => x.id === a.id);
  if (!b) return fail('Batch not found.');
  const put = (next, summary) => log(b.id, summary, {batches: state.batches.map((x) => (x.id === b.id ? next : x))});
  switch (a.type) {
    case 'decide': {
      const labels = {hold: 'Held for extra inspection', release: 'Released with no action', investigate: 'Opened an investigation'};
      if (!labels[a.decision]) return fail('Unknown decision.');
      if (!allow('decide')) return fail('Only engineers or the plant manager decide on batches.');
      if (reason.length < 8) return fail('Give a reason of at least 8 characters — it goes on the batch record.');
      return put({...b, status: a.decision, decision: {label: labels[a.decision], reason, by: actor}}, `${labels[a.decision]} — “${reason}”`);
    }
    case 'reopen':
      if (!allow('decide')) return fail('Your role cannot reopen batches.');
      return put({...b, status: 'open', decision: null}, 'Reopened');
    case 'note': {
      if (!allow('note')) return fail('Your role cannot add notes.');
      const text = (a.text || '').trim();
      if (text.length < 3) return fail('Write a note first.');
      return put({...b, notes: [...b.notes, {at: now(), actor, text}]}, 'Added a note');
    }
    default:
      return fail('Unknown action.');
  }
}
