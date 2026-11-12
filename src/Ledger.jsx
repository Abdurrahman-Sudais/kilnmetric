import React, {useEffect, useState} from 'react';
import site from './content.js';
import {batches, model, people, product, reference, roles, windows} from './data.js';
import {act, can, curve, initial, pattern, risk} from './engine.js';

const KEY = 'kilnmetric-ledger-v1';
const W = 520, H = 220;
const X = (t) => 36 + (t / 60) * (W - 50), Y = (c) => H - 28 - (c / 1250) * (H - 46);
const pathOf = (pts) => pts.map(([t, c], i) => `${i ? 'L' : 'M'}${X(t).toFixed(1)} ${Y(c).toFixed(1)}`).join(' ');
const STATUS = {open: 'To review', hold: 'Held for inspection', release: 'Released', investigate: 'Investigating'};

export default function Ledger() {
  const [state, setState] = useState(() => initial(batches, roles));
  const [sel, setSel] = useState('KB-309');
  const [tab, setTab] = useState('batch');
  const [msg, setMsg] = useState('');
  const [reason, setReason] = useState('');
  const [note, setNote] = useState('');
  const [trial, setTrial] = useState({variable: 'cool', value: '27', reason: ''});
  const [res, setRes] = useState({});
  useEffect(() => { try { const s = JSON.parse(localStorage.getItem(KEY) || 'null'); if (s?.batches) setState(s); } catch { /* ignore */ } }, []);
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* ignore */ } }, [state]);

  const actor = people[state.role];
  const allow = (p) => can(roles, state.role, p);
  const run = (a, after) => { const r = act(state, a, {roles, actor, windows}); setMsg(r.ok ? '' : r.error); if (r.ok) { setState(r.state); after?.(); } };
  const b = state.batches.find((x) => x.id === sel);
  const r = risk(b, model);
  const pats = [pattern(state.batches, 'Clay lot L-77', (x) => x.clay === 'L-77'), pattern(state.batches, 'Cooling > 33 °C/min', (x) => x.cool > 33), pattern(state.batches, 'Moisture > 6%', (x) => x.moisture > 6), pattern(state.batches, 'Peak > 10 °C off target', (x) => Math.abs(x.peak - 1150) > 10)];
  const exportLog = () => {
    const rows = [['time', 'person', 'role', 'item', 'change'], ...state.log.map((l) => [l.at, l.actor, l.role, l.id, l.summary])].map((x) => x.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','));
    const url = URL.createObjectURL(new Blob([rows.join('\n')], {type: 'text/csv'})); const a = document.createElement('a'); a.href = url; a.download = 'kilnmetric-log.csv'; a.click(); URL.revokeObjectURL(url);
  };

  return (
    <div className="ledger">
      <header className="lg-top">
        <a href="/" className="brand" aria-label="Back to the KilnMetric website">← Kiln<i>Metric</i></a>
        <span className="lg-prod">{product.name} · {product.kiln} · {product.cycle}</span>
        <label className="lg-role">Signed in as <select value={state.role} onChange={(e) => run({type: 'role', role: e.target.value})}>{roles.map((x) => <option key={x.id} value={x.id}>{x.label}</option>)}</select></label>
        <button className="btn ghost sm" onClick={() => { setState(initial(batches, roles)); setMsg(''); }}>Reset</button>
      </header>
      <p className="lg-banner">Fictional batches. Risk scores are estimates with their reasons shown; engineers decide and approve trials.</p>
      <main className="lg-main">
        <h1>{site.app.title}</h1>
        <div className="lg-tabs">{[['batch', 'Batches'], ['patterns', 'Patterns'], ['trials', `Trials (${state.trials.length})`], ['log', 'Log']].map(([id, t]) => <button key={id} aria-pressed={tab === id} className={tab === id ? 'on' : ''} onClick={() => { setTab(id); setMsg(''); }}>{t}</button>)}</div>
        {msg && <p className="lg-err" role="alert">{msg}</p>}

        {tab === 'batch' && (
          <div className="lg-grid">
            <aside className="lg-card lg-list" aria-label="Batches">
              <ul>{state.batches.map((x) => { const p = risk(x, model).p; return (
                <li key={x.id}><button className={x.id === sel ? 'on' : ''} onClick={() => { setSel(x.id); setMsg(''); setReason(''); }}>
                  <span className="rk" style={{'--p': Math.min(1, p / 0.2)}} aria-hidden="true" />
                  <span><b>{x.id}</b> · {x.day}<small>{x.inspected ? `${(x.inspected.rate * 100).toFixed(1)}% rejected` : `${(p * 100).toFixed(0)}% est. risk · not inspected`} · {STATUS[x.status]}</small></span>
                </button></li>); })}</ul>
            </aside>
            <section className="lg-card" aria-labelledby="b-title">
              <p className="eyebrow">{b.day} · clay {b.clay} · glaze {b.glaze}</p>
              <h2 id="b-title">{b.id}</h2>
              <dl className="facts"><div><dt>Peak</dt><dd>{b.peak} °C</dd></div><div><dt>Cooling</dt><dd>{b.cool} °C/min</dd></div><div><dt>Moisture</dt><dd>{b.moisture}%</dd></div><div><dt>Est. risk</dt><dd className={r.p > 0.1 ? 'hot' : ''}>{(r.p * 100).toFixed(1)}%</dd></div></dl>
              <svg viewBox={`0 0 ${W} ${H}`} className="lg-curve" role="img" aria-label={`Firing curve of ${b.id} against the reference`}>
                {[300, 600, 900, 1200].map((c) => <g key={c}><path d={`M36 ${Y(c)} H${W - 10}`} className="gridl" /><text x="30" y={Y(c) + 4} textAnchor="end" className="ax">{c}°</text></g>)}
                <path d={pathOf(reference)} className="c-ref" />
                <path d={pathOf(curve(b, reference))} className="c-batch" />
                {[0, 20, 40, 58].map((t) => <text key={t} x={X(t)} y={H - 8} textAnchor="middle" className="ax">{t} min</text>)}
              </svg>
              <h3>What drives the estimate</h3>
              {r.parts.length ? <ul className="contrib">{r.parts.map((p) => <li key={p.key}><span>{p.label}</span><i style={{'--w': `${Math.min(100, (p.contribution / 1) * 100)}%`}} /><b>+{p.contribution.toFixed(2)}</b></li>)}</ul> : <p className="lg-fine">Nothing above the reference — baseline risk only.</p>}
              {b.inspected && <><h3>Inspection result</h3><p className="insp">{(b.inspected.rate * 100).toFixed(1)}% rejected · {Object.entries(b.inspected.defects).map(([k, v]) => `${k} ${v}`).join(' · ')}</p></>}
              <h3>Notes</h3>
              <ul className="lg-notes">{b.notes.map((n, i) => <li key={i}><b>{n.actor}</b> {n.text}</li>)}{!b.notes.length && <li className="lg-fine">No notes.</li>}</ul>
              <div className="lg-row"><input aria-label="Add a note" placeholder="Note for the batch record" value={note} disabled={!allow('note')} onChange={(e) => setNote(e.target.value)} /><button className="btn ghost sm" disabled={!allow('note')} onClick={() => run({type: 'note', id: b.id, text: note}, () => setNote(''))}>Add</button></div>
              <h3>Decision</h3>
              {b.status !== 'open' ? (
                <div className="decided"><b>{b.decision.label}</b><p>“{b.decision.reason}” — {b.decision.by}</p>{allow('decide') && <button className="btn ghost sm" onClick={() => run({type: 'reopen', id: b.id})}>Reopen</button>}</div>
              ) : (
                <>
                  <textarea aria-label="Reason" rows="2" placeholder="Reason (required)" value={reason} onChange={(e) => setReason(e.target.value)} disabled={!allow('decide')} />
                  <div className="lg-row">
                    <button className="btn sm" disabled={!allow('decide')} onClick={() => run({type: 'decide', id: b.id, decision: 'hold', reason}, () => setReason(''))}>Hold for extra inspection</button>
                    <button className="btn ghost sm" disabled={!allow('decide')} onClick={() => run({type: 'decide', id: b.id, decision: 'investigate', reason}, () => setReason(''))}>Open investigation</button>
                    <button className="btn ghost sm" disabled={!allow('decide')} onClick={() => run({type: 'decide', id: b.id, decision: 'release', reason}, () => setReason(''))}>Release, no action</button>
                  </div>
                  {!allow('decide') && <p className="lg-fine">Process engineers and the plant manager decide on batches.</p>}
                </>
              )}
            </section>
          </div>
        )}

        {tab === 'patterns' && (
          <section className="lg-card" aria-labelledby="p-title">
            <h2 id="p-title">Rejection rate with and without each condition</h2>
            <table className="lg-tbl"><thead><tr><th>Condition</th><th>With</th><th>Without</th><th>Batches</th></tr></thead>
              <tbody>{pats.map((p) => <tr key={p.label}><td>{p.label}</td><td className={p.with > p.without * 1.5 ? 'hot' : ''}>{p.with == null ? '—' : `${(p.with * 100).toFixed(1)}%`}</td><td>{p.without == null ? '—' : `${(p.without * 100).toFixed(1)}%`}</td><td>{p.n[0]} / {p.n[1]}</td></tr>)}</tbody></table>
            <p className="lg-fine">From inspected batches only. Small samples — use patterns to choose trials, not to conclude causes.</p>
          </section>
        )}

        {tab === 'trials' && (
          <section className="lg-card" aria-labelledby="t-title">
            <h2 id="t-title">Engineer-approved trials</h2>
            <div className="trial-form">
              <select aria-label="Setting" value={trial.variable} onChange={(e) => setTrial({...trial, variable: e.target.value})} disabled={!allow('plan')}>{Object.entries(windows).map(([k, w]) => <option key={k} value={k}>{w.label}</option>)}</select>
              <label>set to <input aria-label="Trial value" value={trial.value} inputMode="decimal" onChange={(e) => setTrial({...trial, value: e.target.value})} disabled={!allow('plan')} /> {windows[trial.variable].unit}</label>
              <span className="lg-fine">approved window {windows[trial.variable].range.join('–')} · reference {windows[trial.variable].ref}</span>
              <input aria-label="Hypothesis" placeholder="Hypothesis, e.g. slower cooling reduces cracks on L-77" value={trial.reason} onChange={(e) => setTrial({...trial, reason: e.target.value})} disabled={!allow('plan')} />
              <button className="btn sm" disabled={!allow('plan')} onClick={() => run({type: 'plan', ...trial}, () => setTrial({...trial, reason: ''}))}>Approve trial</button>
            </div>
            <ul className="trials">{state.trials.map((t) => (
              <li key={t.id}>
                <p><b>{t.id}</b> · {windows[t.variable].label} {t.value} {windows[t.variable].unit} · “{t.reason}” · approved by {t.by}</p>
                {t.result ? <p className="res">Control {t.result.control}% · trial {t.result.trial}% rejected <em>({t.result.trial < t.result.control ? 'trial lower' : 'no improvement'})</em> — recorded by {t.result.by}</p> : (
                  <div className="lg-row">
                    <input aria-label="Control rejection %" placeholder="Control %" value={res[t.id]?.c || ''} onChange={(e) => setRes({...res, [t.id]: {...res[t.id], c: e.target.value}})} disabled={!allow('result')} />
                    <input aria-label="Trial rejection %" placeholder="Trial %" value={res[t.id]?.t || ''} onChange={(e) => setRes({...res, [t.id]: {...res[t.id], t: e.target.value}})} disabled={!allow('result')} />
                    <button className="btn ghost sm" disabled={!allow('result')} onClick={() => run({type: 'result', id: t.id, control: res[t.id]?.c, trial: res[t.id]?.t})}>Record result</button>
                  </div>
                )}
              </li>
            ))}{!state.trials.length && <li className="lg-fine">No trials yet.</li>}</ul>
          </section>
        )}

        {tab === 'log' && (
          <section className="lg-card" aria-labelledby="l-title">
            <h2 id="l-title">Batch record log</h2>
            {allow('export') && state.log.length > 0 && <button className="btn ghost sm" onClick={exportLog}>Export log</button>}
            <ul className="lg-log">{state.log.map((l, i) => <li key={i}><time>{new Date(l.at).toLocaleTimeString()}</time><b>{l.actor}</b><span>{l.id}</span><span>{l.summary}</span></li>)}{!state.log.length && <li className="lg-fine">Decisions, trials and results appear here.</li>}</ul>
            <table className="lg-tbl"><thead><tr><th>Role</th><th>Decide</th><th>Approve trials</th><th>Record results</th><th>Export</th></tr></thead><tbody>{roles.map((x) => <tr key={x.id}><td>{x.label}</td>{['decide', 'plan', 'result', 'export'].map((p) => <td key={p}>{x.can.includes(p) ? '✓' : '—'}</td>)}</tr>)}</tbody></table>
          </section>
        )}
      </main>
    </div>
  );
}
