# SitePravo — Legal & Compliance Audit API

<p align="center">
  <a href="https://sitepravo.ru"><img src="https://img.shields.io/badge/Live%20Service-sitepravo.ru-blue?style=for-the-badge" alt="Live Service"/></a>
  <img src="https://img.shields.io/badge/Parameters-650%2B-brightgreen?style=for-the-badge" alt="650+ parameters"/>
  <img src="https://img.shields.io/badge/Directions-16-orange?style=for-the-badge" alt="16 directions"/>
  <img src="https://img.shields.io/badge/License-Apache%202.0-lightgrey?style=for-the-badge" alt="License"/>
  <img src="https://img.shields.io/badge/API-REST%20JSON-blueviolet?style=for-the-badge" alt="REST API"/>
</p>

<p align="center">
  <strong>Автоматический юридический и compliance-аудит сайтов по российскому законодательству.</strong><br/>
  650+ параметров · 16 направлений · Rule engine + ИИ · 2–4 минуты
</p>

---

## Что проверяет SitePravo

| Направление | Что анализируем | Законодательство |
|-------------|----------------|-----------------|
| 📄 Документы | Политика ПДн, оферта, пользовательское соглашение | ФЗ-152, ГК РФ |
| 🍪 Cookies | Баннер, категории, dark patterns, reject/accept | ФЗ-152 ст.9, EDPB |
| 📝 Формы и согласия | Доказуемость, consent proximity, отзыв | ФЗ-152 ст.9 |
| 🏢 Реквизиты | ИНН, ОГРН, ФНС-статус ликвидации | ЗоЗПП, ФЗ-149 |
| 📢 ERID-маркировка | Наличие и формат ERID-токена | 38-ФЗ ст.18.1 |
| 🛒 Ecommerce | Оферта, возврат, 54-ФЗ, ценообразование | ЗоЗПП ст.26.1 |
| 🏥 Медицина | Лицензии Росздравнадзора, телемедицина | 323-ФЗ, 38-ФЗ |
| 💰 Финансы | Лицензии ЦБ, МФО, реклама кредитов | 353-ФЗ, 38-ФЗ |
| 🔞 Возраст 18+ | Age-gate, возрастная маркировка | 436-ФЗ, 394-ФЗ |
| 🌍 Геолокация | Локализация ПДн, иностранный сервер | ФЗ-152, 242-ФЗ |
| 🔗 Внешние сервисы | 67+ RU/иностранных сервисов, vendor risk | ФЗ-152 |
| 🔒 Security | TLS, заголовки, reputation IP | OWASP, CIS |
| 📊 SEO | Метаданные, canonical, robots.txt | Google Guidelines |
| 👤 Публикация людей | Фото без согласия, персональные данные | ФЗ-152 |
| 📱 Маркетинг | Запрещённые claims, гарантии результата | ФАС, 38-ФЗ |
| 🏭 Отраслевые | СМИ, образование, туризм, строительство | 273-ФЗ, 2124-ФЗ |

## Быстрый старт

### curl
```bash
# Запустить аудит
curl -X POST https://sitepravo.ru/api/audits \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com", "agreeToTerms": true, "hasLegalBasis": true}'

# Получить результат (auditId из предыдущего запроса)
curl https://sitepravo.ru/api/audits/{auditId}
```

### Python
```bash
pip install requests
```
```python
from sitepravo import SitePravo

client = SitePravo()  # или SitePravo(api_key="ваш_ключ")
report = client.audit("https://example.com")

print(f"Trust Grade: {report.grade}")
print(f"Findings: {report.total_findings}")

for f in report.critical_findings:
    print(f"[{f.severity}] {f.category}: {f.title}")
```

### JavaScript / Node.js
```bash
npm install sitepravo
```
```javascript
import { SitePravo } from 'sitepravo';

const client = new SitePravo();
const report = await client.audit('https://example.com');

console.log(`Trust Grade: ${report.grade}`);
report.findings
  .filter(f => f.severity === 'critical')
  .forEach(f => console.log(`[${f.category}] ${f.title}`));
```

## API Reference

### POST /api/audits — Запуск аудита
```http
POST https://sitepravo.ru/api/audits
Content-Type: application/json

{
  "url": "https://example.com",
  "profile": "legal_first",
  "agreeToTerms": true,
  "hasLegalBasis": true
}
```

**Ответ:**
```json
{
  "id": "uuid-v4",
  "status": "queued",
  "url": "https://example.com"
}
```

### GET /api/audits/:id — Получение результата
```http
GET https://sitepravo.ru/api/audits/{id}
```

**Ответ (завершённый аудит):**
```json
{
  "id": "uuid-v4",
  "url": "https://example.com",
  "grade": "B",
  "score": 72,
  "findings": [
    {
      "id": "cookies-1",
      "category": "cookies",
      "severity": "high",
      "title": "Cookie-баннер отсутствует при использовании аналитики",
      "where": "https://example.com",
      "whyRisk": "ФЗ-152 требует согласия пользователя до установки идентифицирующих cookies...",
      "fix": "Установите cookie-баннер с раздельными категориями согласия...",
      "confidence": 0.95
    }
  ],
  "summary": {
    "critical": 0,
    "high": 3,
    "medium": 7,
    "low": 4
  },
  "checkedAt": "2026-06-04T12:00:00Z"
}
```

### Trust Grade

| Grade | Score | Значение |
|-------|-------|---------|
| A+ | 95–100 | Образцовое соответствие |
| A | 85–94 | Хороший уровень |
| B | 70–84 | Требует внимания |
| C | 50–69 | Серьёзные пробелы |
| D | 25–49 | Критические нарушения |
| ❗ | 0–24 | Критический уровень риска |

## Severity уровни

| Severity | Значение |
|----------|---------|
| `critical` | Нарушение с высоким риском штрафа или блокировки |
| `high` | Значимое отклонение от требований законодательства |
| `medium` | Рекомендуемое исправление, не критично срочно |
| `low` | Незначительное замечание или лучшая практика |

## GitHub Actions — автоматический аудит в CI/CD

```yaml
# .github/workflows/legal-audit.yml
name: Legal Compliance Audit

on:
  push:
    branches: [main]
  schedule:
    - cron: '0 9 * * 1'  # Каждый понедельник 9:00

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - name: Run SitePravo Audit
        uses: Gudvin82/sitepravo@v1
        with:
          url: ${{ vars.SITE_URL }}
          fail_on_critical: true
```

## Use Cases

- **Разработчики и веб-студии** — автоматическая проверка перед релизом
- **Юридические отделы** — быстрый первичный скрининг сайтов клиентов
- **Маркетплейсы и агрегаторы** — массовая проверка сайтов поставщиков
- **Compliance-менеджеры** — регулярный мониторинг изменений
- **CI/CD** — gate перед деплоем новых посадочных страниц

## Методология

Подробнее о том, как работает аудит: [sitepravo.ru/methodology](https://sitepravo.ru/methodology)

- **Rule engine** — детерминированные проверки, scoring, explainability
- **Browser runtime** — consent, cookies, XHR-формы, localStorage
- **AI-слой** — контекстный анализ документов и claims
- **Factual-сверка** — ФНС, РКН (895K доменов), DaData, SSL Labs, crt.sh

## Лицензия

Apache License 2.0 — клиентский код открыт. Движок работает как облачный сервис.

---

<p align="center">
  <a href="https://sitepravo.ru">🌐 Запустить аудит</a> ·
  <a href="https://sitepravo.ru/methodology">📖 Методология</a> ·
  <a href="https://sitepravo.ru/faq">❓ FAQ</a>
</p>
