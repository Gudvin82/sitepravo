# sitepravo — JavaScript/Node.js Client

```bash
npm install sitepravo
```

```js
import { SitePravo } from 'sitepravo';

const client = new SitePravo();
const report = await client.audit('https://example.com');

console.log(`Grade: ${report.grade}  Score: ${report.score}/100`);
report.findings
  .filter(f => f.severity === 'critical')
  .forEach(f => console.log(`[${f.category}] ${f.title}`));
```

TypeScript types included. See the [root README](../README.md) for full documentation.
