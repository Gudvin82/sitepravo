/**
 * Базовый пример: аудит одного сайта.
 * node examples/basic_audit.js https://example.com
 */
import { SitePravo } from '../sitepravo.js';

const url = process.argv[2] || 'https://example.com';

console.log(`Запуск аудита: ${url}\n`);

const client = new SitePravo();
const report = await client.audit(url, {
  onProgress: (status, elapsed) => {
    process.stdout.write(`\r  ⏳ ${status} (${Math.round(elapsed / 1000)}с)  `);
  },
});

console.log(`\n\n${'='.repeat(60)}`);
console.log(`URL:   ${report.url}`);
console.log(`Grade: ${report.grade}   Score: ${report.score}/100`);
console.log(`Всего: ${report.totalFindings} находок`);
console.log(`  critical: ${report.summary.critical ?? 0}`);
console.log(`  high:     ${report.summary.high ?? 0}`);
console.log(`  medium:   ${report.summary.medium ?? 0}`);
console.log(`  low:      ${report.summary.low ?? 0}`);
console.log(`${'='.repeat(60)}\n`);

if (report.criticalFindings.length > 0) {
  console.log('🚨 КРИТИЧЕСКИЕ НАРУШЕНИЯ:');
  for (const f of report.criticalFindings) {
    console.log(`\n  [${f.id}] ${f.title}`);
    console.log(`  Где: ${f.where}`);
    console.log(`  Риск: ${f.whyRisk.slice(0, 200)}`);
    console.log(`  Исправить: ${f.fix.slice(0, 200)}`);
  }
} else {
  console.log('✅ Критических нарушений не найдено');
}

if (report.highFindings.length > 0) {
  console.log(`\n⚠️  ВЫСОКИЙ ПРИОРИТЕТ (${report.highFindings.length} шт.):`);
  for (const f of report.highFindings.slice(0, 5)) {
    console.log(`  - [${f.category}] ${f.title}`);
  }
}
