import React, {useState} from 'react';
import site from './content.js';
import {batches, model, reference} from './data.js';
import {curve, pattern, risk} from './engine.js';
import Ledger from './Ledger.jsx';
import LeadForm from './LeadForm.jsx';

/* A Delft-style tile: cobalt quatrefoil with corner ornaments; optional crack. */
export function Tile({size = 70, cracked = false, tone = '#1f3fae', label}) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" className={cracked ? 'tile cracked' : 'tile'} role={label ? 'img' : undefined} aria-label={label} aria-hidden={label ? undefined : true}>
      <rect x="1" y="1" width="58" height="58" rx="3" fill="#fbfaf6" stroke={tone} strokeWidth="1.5" />
      <path d="M30 12c5 0 8 4 8 8 4 0 8 3 8 8s-4 8-8 8c0 4-3 8-8 8s-8-4-8-8c-4 0-8-3-8-8s4-8 8-8c0-4 3-8 8-8z" fill="none" stroke={tone} strokeWidth="1.6" />
      <circle cx="30" cy="30" r="4" fill={tone} />
      {[[6, 6], [54, 6], [6, 54], [54, 54]].map(([x, y]) => <path key={x + '' + y} d={`M${x} ${y} m-4 0 q4 -4 8 0 q-4 4 -8 0`} fill={tone} opacity=".8" />)}
      {cracked && <path d="M14 4 L22 18 L18 26 L28 36 L25 46 L33 57" className="crack" />}
    </svg>
  );
}

function Mark() {
  return <svg width="34" height="34" viewBox="0 0 40 40" aria-hidden="true"><rect x="2" y="2" width="36" height="36" rx="6" fill="#1f3fae" /><path d="M10 28 C14 12 26 12 30 28" fill="none" stroke="#fbfaf6" strokeWidth="2.6" strokeLinecap="round" /><path d="M20 10 v4 M12 14 l2 3 M28 14 l-2 3" stroke="#e8743b" strokeWidth="2.2" strokeLinecap="round" /></svg>;
}

function Header() {
  const [open, setOpen] = useState(false);
  const links = [['History', '/#history'], ['Risk', '/#risk'], ['Patterns', '/#patterns'], ['Trials', '/#trials'], ['Pricing', '/#pricing'], ['Founders', '/#founders']];
  return (
    <header className="hdr">
      <a href="/" className="brand" aria-label="KilnMetric home"><Mark /><span>Kiln<i>Metric</i></span></a>
      <nav id="nav" className={open ? 'nav open' : 'nav'} aria-label="Main">
        {links.map(([t, h]) => <a key={t} href={h} onClick={() => setOpen(false)}>{t}</a>)}
        <a className="nav-app" href="/app" onClick={() => setOpen(false)}>Firing ledger</a>
      </nav>
      <a className="hdr-cta" href="/app">Firing ledger</a>
      <button className="menu" aria-expanded={open} aria-controls="nav" onClick={() => setOpen(!open)}>{open ? 'Close' : 'Menu'}</button>
    </header>
  );
}

const W = 600, H = 300;
const X = (t) => 40 + (t / 60) * (W - 60), Y = (c) => H - 40 - (c / 1250) * (H - 70);
const pathOf = (pts) => pts.map(([t, c], i) => `${i ? 'L' : 'M'}${X(t).toFixed(1)} ${Y(c).toFixed(1)}`).join(' ');

function Hero() {
  const hot = batches.find((b) => b.id === 'KB-304');
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero-copy">
        <p className="eyebrow">Ceramic manufacturing analytics</p>
        <h1 id="hero-title">Learn from every <em>firing cycle.</em></h1>
        <p className="lede">{site.about}</p>
        <div className="actions"><a className="btn" href="/app">Open the firing ledger</a><a className="btn ghost" href="#pilot">Start a pilot</a></div>
      </div>
      <figure className="kiln" data-draw aria-label="Firing curve: the reference profile and a batch that cooled too quickly">
        <svg viewBox={`0 0 ${W} ${H}`}>
          <defs><linearGradient id="heat" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stopColor="#fbfaf6" /><stop offset="1" stopColor="#f7d9c4" /></linearGradient></defs>
          {[['Drying', 0, 8], ['Preheat', 8, 31], ['Peak', 31, 40], ['Cooling', 40, 58]].map(([t, a, b], i) => (
            <g key={t}><rect x={X(a)} y="20" width={X(b) - X(a)} height={H - 60} className={i === 2 ? 'zone peak' : 'zone'} /><text x={(X(a) + X(b)) / 2} y="36" textAnchor="middle" className="zone-lbl">{t}</text></g>
          ))}
          {[300, 600, 900, 1200].map((c) => <g key={c}><path d={`M40 ${Y(c)} H${W - 20}`} className="gridl" /><text x="34" y={Y(c) + 4} textAnchor="end" className="ax">{c}°</text></g>)}
          <path d={pathOf(reference)} className="c-ref" pathLength="1" />
          <path d={pathOf(curve(hot, reference))} className="c-batch" pathLength="1" />
          <text x={X(42)} y={Y(170)} textAnchor="end" className="ann">KB-304 cooled at 36 °C/min →</text>
          {[0, 10, 20, 30, 40, 50, 58].map((t) => <text key={t} x={X(t)} y={H - 18} textAnchor="middle" className="ax">{t} min</text>)}
        </svg>
        <div className="tiles-row" aria-hidden="true">{[0, 1, 2, 3, 4, 5, 6, 7].map((i) => <Tile key={i} size={46} cracked={[2, 5].includes(i)} />)}</div>
        <figcaption>Reference curve in cobalt; a fictional batch in ember. Two in eight tiles from it showed cracks at sorting.</figcaption>
      </figure>
    </section>
  );
}

const CHAIN = [['Raw material lot', 'Clay L-77 · moisture 5.7%'], ['Pressing', 'Body density, moisture'], ['Glazing', 'Glaze G-12 · weight'], ['Firing', 'Peak 1,151 °C · cooling 36 °C/min'], ['Inspection', '11.8% rejected · cracks 41']];

function History() {
  return (
    <section className="sec" id="history" aria-labelledby="hist-title">
      <div className="ornament" aria-hidden="true" />
      <p className="eyebrow center">Batch history</p>
      <h2 id="hist-title" className="center">Every tile carries a history. Most plants keep it in five places.</h2>
      <p className="txt center">Material lots live with stores, firing curves with the kiln controller, inspection results on the sorting line. KilnMetric joins them per batch, so a rejected batch can be traced back through every stage it passed.</p>
      <ol className="chain">{CHAIN.map(([t, d], i) => (
        <li key={t} data-rise style={{'--i': i}}><Tile size={64} cracked={i === 4} /><h3>{t}</h3><p>{d}</p></li>
      ))}</ol>
    </section>
  );
}

function Dial({p}) {
  const a = Math.PI * (1 - Math.min(1, p / 0.3));
  return (
    <svg viewBox="0 0 200 150" className="dial" role="img" aria-label={`Estimated defect risk ${Math.round(p * 100)} percent`}>
      <path d="M20 100 A80 80 0 0 1 180 100" className="dial-track" />
      <path d="M20 100 A80 80 0 0 1 180 100" className="dial-fill" style={{strokeDasharray: `${Math.min(1, p / 0.3) * 251} 251`}} />
      <line x1="100" y1="100" x2={100 + 66 * Math.cos(a)} y2={100 - 66 * Math.sin(a)} className="needle" />
      <circle cx="100" cy="100" r="6" fill="#0f1f5c" />
      <text x="100" y="140" textAnchor="middle" className="dial-v">{(p * 100).toFixed(0)}%</text>
    </svg>
  );
}

function Risk() {
  const b = batches.find((x) => x.id === 'KB-309');
  const r = risk(b, model);
  const max = Math.max(...r.parts.map((p) => p.contribution));
  return (
    <section className="sec band" id="risk" aria-labelledby="risk-title">
      <div className="split">
        <div>
          <p className="eyebrow">Defect-risk prediction</p>
          <h2 id="risk-title">Know which batches deserve a closer look — before the sorting line.</h2>
          <p className="txt">KilnMetric estimates each batch’s defect risk from its material lot, pressed-body moisture and firing record, and shows exactly what pushed the estimate up. Engineers decide whether to hold a batch for extra inspection.</p>
        </div>
        <article className="riskcard" data-rise>
          <p className="rc-h"><b>{b.id}</b> · clay {b.clay} · glaze {b.glaze} · fired {b.day}</p>
          <Dial p={r.p} />
          <h3>Why the estimate is high</h3>
          <ul className="contrib">{r.parts.map((p) => <li key={p.key}><span>{p.label}</span><i style={{'--w': `${(p.contribution / max) * 100}%`}} /><b>+{p.contribution.toFixed(2)}</b></li>)}</ul>
          <p className="fine">Contributions to the model’s log-odds. Not yet inspected — this is a prediction, not a result.</p>
        </article>
      </div>
    </section>
  );
}

function Patterns() {
  const pats = [pattern(batches, 'Clay lot L-77', (b) => b.clay === 'L-77'), pattern(batches, 'Cooling faster than 33 °C/min', (b) => b.cool > 33), pattern(batches, 'Pressed-body moisture above 6%', (b) => b.moisture > 6), pattern(batches, 'Peak more than 10 °C off target', (b) => Math.abs(b.peak - 1150) > 10)];
  return (
    <section className="sec" id="patterns" aria-labelledby="pat-title">
      <div className="ornament" aria-hidden="true" />
      <p className="eyebrow center">Pattern analysis</p>
      <h2 id="pat-title" className="center">Conditions that keep turning up beside rejected batches.</h2>
      <div className="pats">{pats.map((p) => (
        <article key={p.label} className="pat" data-rise>
          <h3>{p.label}</h3>
          <div className="pat-bars">
            <div><span style={{height: `${(p.with / 0.12) * 100}%`}} className="hot" /><b>{(p.with * 100).toFixed(1)}%</b><small>with ({p.n[0]})</small></div>
            <div><span style={{height: `${(p.without / 0.12) * 100}%`}} /><b>{(p.without * 100).toFixed(1)}%</b><small>without ({p.n[1]})</small></div>
          </div>
        </article>
      ))}</div>
      <p className="fine center">Average rejection rate of inspected sample batches, with and without each condition. Small samples, and association is not chemistry — which is why the next step is a trial.</p>
    </section>
  );
}

function Trials() {
  return (
    <section className="sec band" id="trials" aria-labelledby="tr-title">
      <div className="split">
        <div>
          <p className="eyebrow">Trial tracking</p>
          <h2 id="tr-title">Trials, not hunches.</h2>
          <p className="txt">When a pattern looks real, an engineer approves a controlled trial inside the approved process window — slower cooling on half the next batches, say — and KilnMetric compares the results with the control.</p>
          <ol className="tr-steps"><li>Engineer states the hypothesis</li><li>Setting stays inside the approved window</li><li>Inspectors record control and trial results</li><li>The finding is kept with the batch history</li></ol>
        </div>
        <figure className="plates" aria-label="Illustrative trial: control batches at 34 °C per minute cooling versus trial batches at 28 °C per minute">
          <div className="plate" data-rise><b>8.6%</b><span>Control</span><small>cooling 34 °C/min</small></div>
          <div className="vs" aria-hidden="true">vs</div>
          <div className="plate trial" data-rise><b>4.1%</b><span>Trial</span><small>cooling 28 °C/min</small></div>
          <figcaption>Illustrative trial result, for a proposed product.</figcaption>
        </figure>
      </div>
    </section>
  );
}

function Rules() {
  const rules = [['Engineers decide', 'KilnMetric estimates and explains. Holding a batch, opening an investigation or changing a process is a person’s call.'], ['No automatic kiln control', 'It never changes setpoints or curves. Trials are approved by engineers and run by your team.'], ['One product family first', 'Models start narrow, on your own historical records, and widen only when they hold up.'], ['Patterns get tested', 'Associations are labelled as associations until a controlled trial supports them.']];
  return (
    <section className="sec" aria-labelledby="rules-title">
      <div className="ornament" aria-hidden="true" />
      <h2 id="rules-title" className="center">How KilnMetric works with your engineers.</h2>
      <div className="rules">{rules.map(([t, d], i) => <div key={t} data-rise><span className="rn">{['I', 'II', 'III', 'IV'][i]}</span><h3>{t}</h3><p>{d}</p></div>)}</div>
    </section>
  );
}

function Plates() {
  return (
    <section className="sec band" aria-labelledby="pl-title">
      <p className="eyebrow center">Why it matters</p>
      <h2 id="pl-title" className="center">The scale of ceramic production.</h2>
      <div className="statplates">{site.stats.map((s) => (
        <figure key={s.label} className="statplate" data-rise><div className="rim"><b>{s.value}</b></div><figcaption>{s.label}<a href={s.url} target="_blank" rel="noopener noreferrer">{s.source} ↗</a></figcaption></figure>
      ))}</div>
      <p className="fine center">Published figures from the sources linked. They describe the industry, not KilnMetric results.</p>
    </section>
  );
}

function Who() {
  const who = [['Tile manufacturers', 'Wall and floor tile lines'], ['Sanitaryware producers', 'Long cycles, costly rejects'], ['Pottery factories', 'Many glazes, many curves'], ['Ceramic process engineers', 'Evidence for every change']];
  return (
    <section className="sec" aria-labelledby="who-title">
      <p className="eyebrow center">Who it’s for</p>
      <h2 id="who-title" className="center">For the people who answer to the sorting line.</h2>
      <div className="who">{who.map(([t, d], i) => <div key={t} data-rise><Tile size={54} tone={i % 2 ? '#2f6b55' : '#1f3fae'} /><h3>{t}</h3><p>{d}</p></div>)}</div>
      <p className="fine center">Organisation types are prospective customers; no affiliation is implied.</p>
    </section>
  );
}

function Pricing() {
  const tiers = [['Line', '$1,100', 'per kiln line / month', ['One product family', 'Batch history & risk scores', 'Pattern analysis', 'Trial tracking']], ['Plant', '$3,200', 'per plant / month', ['Up to 4 kiln lines', 'Multiple product families', 'Inspection note classification', 'Unlimited users'], true], ['Group', 'Custom', '', ['Multiple plants', 'Controller & MES integration', 'Shared pattern library', 'Dedicated support']]];
  return (
    <section className="sec band" id="pricing" aria-labelledby="pr-title">
      <p className="eyebrow center">Pricing</p>
      <h2 id="pr-title" className="center">Priced per kiln line.</h2>
      <p className="txt center">Illustrative pricing for a proposed product, agreed with pilot plants.</p>
      <div className="tiers">{tiers.map(([n, p, u, f, hot]) => (
        <article key={n} className={hot ? 'tier hot' : 'tier'} data-rise><div className="ornament small" aria-hidden="true" /><h3>{n}</h3><p className="price"><b>{p}</b><span>{u}</span></p><ul>{f.map((x) => <li key={x}>{x}</li>)}</ul><a className={hot ? 'btn' : 'btn ghost'} href="#pilot">{n === 'Group' ? 'Talk to us' : 'Start a pilot'}</a></article>
      ))}</div>
    </section>
  );
}

function Stack() {
  const parts = [['Amazon SageMaker AI', 'Defect-risk models'], ['Amazon Bedrock', 'Classifying inspection notes'], ['Amazon S3', 'Production datasets'], ['Amazon DynamoDB', 'Batch histories'], ['AWS Lambda', 'Processing imported logs']];
  return (
    <section className="sec" aria-labelledby="aws-title">
      <div className="split">
        <div><p className="eyebrow">Proposed platform</p><h2 id="aws-title">Built on AWS.</h2><p className="txt">A proposed design. Nothing is connected to this website; the firing ledger runs in your browser on fictional data.</p></div>
        <ul className="parts">{parts.map(([a, b]) => <li key={a} data-rise><b>{a}</b><span>{b}</span></li>)}</ul>
      </div>
    </section>
  );
}

function Founders() {
  return (
    <section className="sec band" id="founders" aria-labelledby="f-title">
      <p className="eyebrow center">Founders</p>
      <h2 id="f-title" className="center">The people behind KilnMetric.</h2>
      <div className="founders">{site.team.map((p) => (
        <article key={p.name} data-rise><div className="frame"><span>{p.initials}</span></div><p className="role">{p.role === 'Founder/CEO' ? 'Founder & CEO' : 'Co-founder'}</p><h3>{p.name}</h3><p>{p.bio}</p></article>
      ))}</div>
    </section>
  );
}

const FAQ = [
  ['What data does KilnMetric need?', 'Historical firing curves or controller logs, raw-material batch records and inspection results for one product family. Inspection notes can be free text.'],
  ['Does it control the kiln?', 'No. It estimates risk and surfaces patterns. Engineers approve any trial or process change, and your team runs it.'],
  ['How reliable are the risk estimates?', 'They start from your own records and are checked against inspection results. Every estimate shows what drove it, so engineers can question it.'],
  ['Is KilnMetric live?', 'Not yet. It is a proposed product; the firing ledger is a prototype running in your browser on fictional data.'],
];

function Faq() {
  return (
    <section className="sec" aria-labelledby="faq-title">
      <p className="eyebrow center">FAQ</p>
      <h2 id="faq-title" className="center">Frequently asked questions.</h2>
      <div className="faq">{FAQ.map(([q, a]) => <details key={q}><summary>{q}</summary><p>{a}</p></details>)}</div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="ftr">
      <div className="ornament light" aria-hidden="true" />
      <a href="/" className="brand light" aria-label="KilnMetric home"><Mark /><span>Kiln<i>Metric</i></span></a>
      <p>{site.tagline}</p>
      <nav aria-label="Footer"><a href="/app">Firing ledger</a><a href="/#pricing">Pricing</a><a href="/privacy">Privacy</a><a href="/terms">Terms</a><a href={`mailto:${site.email}`}>{site.email}</a></nav>
      <p className="fine">© 2026 KilnMetric. Founded by {site.team[0].name} with {site.team[1].name}. A proposed product: pricing is illustrative and the firing ledger uses fictional data.</p>
    </footer>
  );
}

function Home() {
  return (<><Hero /><History /><Risk /><Patterns /><Trials /><Rules /><Plates /><Who /><Pricing /><Stack /><Founders /><Faq /><LeadForm /></>);
}

const LEGAL = {
  privacy: ['Privacy notice', [
    ['This website', 'KilnMetric is a proposed product. This website and the firing ledger run in your browser on fictional data.'],
    ['Firing ledger', 'Your changes are kept in your browser’s local storage (key kilnmetric-ledger-v1) and never leave your device. “Reset” clears them.'],
    ['Pilot requests', `Until a form service is connected, the form keeps your request in this browser and opens a pre-filled email to ${site.email}. Nothing is sent until you send it. This notice will be updated before any customer-relationship service is connected.`],
    ['Cookies & analytics', 'None.'],
  ]],
  terms: ['Terms of use', [
    ['A proposed product', 'Nothing here is an offer of service. Pricing is illustrative.'],
    ['Demonstration only', 'The firing ledger uses fictional data and must not be used for real production decisions.'],
    ['People decide', 'KilnMetric estimates and explains; engineers decide and approve trials.'],
    ['No affiliation', 'Organisation types named are prospective customers; no affiliation is implied.'],
  ]],
};

function Legal({kind}) {
  const [title, items] = LEGAL[kind];
  return <section className="sec legal"><p className="eyebrow">Review draft</p><h1>{title}</h1>{items.map(([t, d]) => <div key={t}><h2>{t}</h2><p>{d}</p></div>)}</section>;
}

function NotFound() {
  return <section className="sec legal"><p className="eyebrow">404</p><h1>This page cracked in the kiln.</h1><p>It isn’t here.</p><p><a className="btn" href="/">Back to KilnMetric</a></p></section>;
}

export default function App({path = '/'}) {
  if (path.startsWith('/app')) return <Ledger />;
  const page = path === '/' ? <Home /> : path === '/privacy' ? <Legal kind="privacy" /> : path === '/terms' ? <Legal kind="terms" /> : <NotFound />;
  return (<><a className="skip" href="#main">Skip to content</a><Header /><main id="main">{page}</main><Footer /></>);
}

