// KilnMetric — site facts used by the pages, the prerender step and the tests.
// A proposed product: pricing is illustrative; the domain and email are placeholders to confirm.
const site = {
  name: 'KilnMetric',
  slug: 'kilnmetric',
  tagline: 'Learn from every firing cycle.',
  about: 'KilnMetric helps ceramic manufacturers connect firing records, material batches and inspection results to estimate defect risk, surface recurring patterns and track engineer-approved trials.',
  url: 'https://kilnmetric.com',
  email: 'olumide@kilnmetric.com',
  team: [
    {name: 'Olumide Fashola', role: 'Founder/CEO', initials: 'OF', bio: 'Olumide has spent his career around kilns and sorting lines, and founded KilnMetric so that every rejected batch teaches the plant something. He leads product, customer partnerships and every pilot line.'},
    {name: 'Amina Bello', role: 'Co-founder', initials: 'AB', bio: 'Amina leads the analytics: connecting firing curves, material lots and inspection results, and building defect-risk models that engineers can question and test.'},
  ],
  stats: [
    {value: '15.9bn m²', label: 'Ceramic tiles produced worldwide in 2023.', source: 'Ceramic World Review / MECS–Acimac', url: 'https://ceramicworldweb.com/en/economics-and-markets/world-production-and-consumption-ceramic-tiles-forecasts-2028'},
    {value: '~60%', label: 'Approximate share of tile production energy used in firing — the most energy-intensive stage.', source: 'TUC', url: 'https://www.tuc.org.uk/node/531871'},
    {value: '1,200–1,300°C', label: 'Typical tile firing temperatures; firing too cool or too briefly produces an inferior product.', source: 'ArchiPro', url: 'https://archipro.com.au/article/shining-the-light-on-water-absorption-and-how-levels-impact-tile-quality-tile-warehouse'},
  ],
  app: {
    title: 'Firing ledger',
    subtitle: 'Review fictional tile batches: firing curves against the reference, estimated defect risk with its reasons, recurring patterns, and engineer-approved trials.',
  },
};
export default site;
