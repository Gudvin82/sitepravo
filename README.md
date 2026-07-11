# SitePravo — Legal & Compliance Audit

<p align="center">
  <a href="https://sitepravo.ru"><img src="https://img.shields.io/badge/🌐 Live-sitepravo.ru-1a5c3a?style=for-the-badge" alt="Live"/></a>
  <img src="https://img.shields.io/badge/Параметров-650+-brightgreen?style=for-the-badge" alt="650+ params"/>
  <img src="https://img.shields.io/badge/Направлений-16-orange?style=for-the-badge" alt="16 directions"/>
  <img src="https://img.shields.io/badge/GitHub_Action-ready-2ea44f?style=for-the-badge" alt="Action"/>
  <img src="https://img.shields.io/badge/ФЗ--152-38--ФЗ-red?style=for-the-badge" alt="Russian law"/>
</p>

<p align="center">
  <b>Автоматический юридический и compliance-аудит сайтов по российскому законодательству</b><br/>
  <i>Automated legal & compliance audit of Russian-market websites</i>
</p>

---

## 🇷🇺 Русская версия

### Что это такое

SitePravo — автоматическая проверка сайта на соответствие российскому законодательству: ФЗ-152, 38-ФЗ, ЗоЗПП, 436-ФЗ и другим. 650+ параметров, 16 направлений, результат за 2–4 минуты.

Показывает конкретные нарушения — «политики конфиденциальности нет», «cookie-баннер не даёт возможности отказать», «ERID-метка отсутствует» — с указанием нормы закона и рекомендацией по исправлению.

Работает как **публичный сервис** (sitepravo.ru) и как **GitHub Action** для автоматизации проверок.

### Что проверяет

| Направление | Что анализируем | Законодательство |
|---|---|---|
| 📄 Документы | Политика ПДн, оферта, пользовательское соглашение | ФЗ-152, ГК РФ |
| 🍪 Cookies | Баннер, категории, dark patterns, reject/accept | ФЗ-152 ст.9, EDPB |
| 📝 Формы и согласия | Доказуемость, consent proximity, отзыв согласия | ФЗ-152 ст.9 |
| 🏢 Реквизиты | ИНН, ОГРН, проверка статуса ликвидации в ФНС | ЗоЗПП, ФЗ-149 |
| 📢 ERID-маркировка | Наличие и формат ERID-токена в рекламе | 38-ФЗ ст.18.1 |
| 🛒 Ecommerce | Оферта, возврат 14 дней, 54-ФЗ, ценообразование | ЗоЗПП ст.26.1 |
| 🏥 Медицина | Лицензии Росздравнадзора, телемедицина | 323-ФЗ, 38-ФЗ |
| 💰 Финансы | Лицензии ЦБ, реклама кредитов, МФО | 353-ФЗ, 38-ФЗ |
| 🔞 Возраст 18+ | Age-gate, возрастная маркировка контента | 436-ФЗ, 394-ФЗ |
| 🌍 Геолокация | Локализация ПДн, иностранный сервер обработки | ФЗ-152, 242-ФЗ |
| 🔗 Внешние сервисы | 67+ RU/иностранных сервисов, vendor risk | ФЗ-152 |
| 🔒 Безопасность | TLS, security headers, reputation IP | OWASP, CIS |
| 📊 SEO | Метаданные, canonical, robots.txt | Google Guidelines |
| 👤 Публикация людей | Фото без согласия, ПДн третьих лиц на сайте | ФЗ-152 |
| 📱 Маркетинг | Запрещённые claims, гарантии результата, абьюз | ФАС, 38-ФЗ |
| 🏭 Отраслевые | СМИ, образование, туризм, строительство | 273-ФЗ, 2124-ФЗ |

### Реальная статистика

> Данные на основе 965 завершённых аудитов

- **91%** сайтов имеют нарушения по ФЗ-152 (cookies или согласия)
- **768** проверок SitePravo выполнено
- **Средний score:** 80/100
- **Среднее время аудита:** 2–4 минуты
- **Уникальных доменов проверено:** 700+

### Быстрый старт — curl

```bash
# 1. Запустить аудит
RESPONSE=$(curl -s -X POST https://sitepravo.ru/api/audits \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com","profile":"legal_first","consentAccepted":true,"legalBasisConfirmed":true}')

AUDIT_ID=$(echo "$RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")
echo "Audit ID: $AUDIT_ID"

# 2. Дождаться результата
while true; do
  RESULT=$(curl -s "https://sitepravo.ru/api/audits/$AUDIT_ID")
  STATUS=$(echo "$RESULT" | python3 -c "import sys,json; print(json.load(sys.stdin).get('status',''))")
  echo "Status: $STATUS"
  [ "$STATUS" = "completed" ] && break
  sleep 5
done

# 3. Вывести результат
echo "$RESULT" | python3 -c "
import sys, json
d = json.load(sys.stdin)
scores = d.get('scores', {})
print(f'Grade: {scores.get(\"trustGrade\",\"?\")}  Score: {scores.get(\"overall\",0)}/100')
for f in d.get('findings', [])[:5]:
    law = f.get('law', '')
    law_str = f'  ← {law}' if law else ''
    print(f'  [{f[\"severity\"]}] {f[\"category\"]}: {f[\"title\"]}{law_str}')
"
```

### GitHub Action — compliance gate в CI/CD

```yaml
# .github/workflows/legal-audit.yml
name: Legal & Compliance Audit

on:
  push:
    branches: [main]
  schedule:
    - cron: '0 10 * * 1'   # каждый понедельник в 10:00

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - name: SitePravo Legal Audit
        uses: Gudvin82/sitepravo@v1
        with:
          url: ${{ vars.SITE_URL }}
          profile: legal_first
          fail_on_critical: true   # блокирует деплой при критических нарушениях
```

**Выходные переменные action:**

| Output | Описание |
|---|---|
| `grade` | Trust Grade: A+, A, B, C, D или ❗ |
| `score` | Числовой score 0–100 |
| `critical_count` | Количество критических нарушений |
| `high_count` | Количество high-нарушений |
| `report_url` | Ссылка на полный отчёт |

### Бесплатные инструменты

Онлайн-инструменты для проверки и подготовки документов — без регистрации:

| Инструмент | Описание |
|---|---|
| [ERID Валидатор](https://sitepravo.ru/erid-checker/) | Проверка формата ERID-метки рекламы (38-ФЗ) |
| [Cookie Чеклист](https://sitepravo.ru/cookie-checklist/) | 16-пунктовый чеклист соответствия cookie-баннера |

### База знаний — 10 руководств

Подробные пошаговые инструкции по выполнению требований закона:

| Руководство | Тема |
|---|---|
| [Чеклист 152-ФЗ](https://sitepravo.ru/guide/checklist-152-fz/) | Полный чеклист требований к сайту |
| [Cookie-баннер](https://sitepravo.ru/guide/cookie-banner-kak-sdelat/) | Как сделать правильный cookie-баннер |
| [ERID-маркировка](https://sitepravo.ru/guide/erid-markirovka-reklamy/) | Маркировка интернет-рекламы |
| [Политика ПДн](https://sitepravo.ru/guide/politika-konfidentsialnosti-obrazec/) | Образец политики конфиденциальности |
| [Оферта](https://sitepravo.ru/guide/oferta-obrazec/) | Образец публичной оферты |
| [Согласие на ПДн](https://sitepravo.ru/guide/soglasie-na-obrabotku-pdn/) | Форма согласия на обработку ПДн |
| [Уведомление в РКН](https://sitepravo.ru/guide/rkn-uvedomlenie/) | Как уведомить Роскомнадзор |
| [Интернет-магазин](https://sitepravo.ru/guide/internet-magazin-152-fz/) | ФЗ-152 для e-commerce |
| [Публикация людей](https://sitepravo.ru/guide/publikaciya-lyudej-na-sajte/) | Фото и данные третьих лиц |
| [Трансграничная передача ПДн](https://sitepravo.ru/guide/transgranichnaya-peredacha-pdn/) | Передача данных за рубеж |

### Профили аудита

| Профиль | Когда использовать |
|---|---|
| `legal_first` | Сайт для российской аудитории — основная проверка |
| `technical_first` | Акцент на техническую безопасность (TLS, headers, CVE) |

### Клиентские библиотеки

Готовые клиенты в директориях репозитория:

- **JavaScript / Node.js** → [`/js/sitepravo.js`](./js/sitepravo.js) (ESM, без зависимостей)
- **Python** → [`/python/sitepravo/`](./python/sitepravo/) (только `requests`)
- **curl** → [`/examples/curl_examples.sh`](./examples/curl_examples.sh)

---

## 🇬🇧 English version

### What is it

SitePravo is an automated legal compliance audit tool for Russian-market websites. It checks 650+ parameters across 16 directions — personal data law (ФЗ-152), advertising law (38-ФЗ), consumer protection (ЗоЗПП), age restrictions (436-ФЗ), and more. Results in 2–4 minutes.

Shows specific violations — "no privacy policy", "cookie banner doesn't allow rejection", "advertising ERID marker missing" — with the applicable law reference and a fix recommendation.

Available as a **public service** (sitepravo.ru) and as a **GitHub Action**.

### What it checks

| Direction | What we analyze | Law / Standard |
|---|---|---|
| 📄 Documents | Privacy policy, public offer, terms of service | ФЗ-152, Civil Code |
| 🍪 Cookies | Banner, categories, dark patterns, reject option | ФЗ-152 Art.9, EDPB |
| 📝 Forms & Consent | Provability, proximity, withdrawal of consent | ФЗ-152 Art.9 |
| 🏢 Legal details | TIN, OGRN, liquidation status check via FTS | Consumer Protection |
| 📢 ERID marking | Presence and format of ERID token in ads | 38-ФЗ Art.18.1 |
| 🛒 E-commerce | Public offer, 14-day return, POS, pricing | Consumer Protection |
| 🏥 Medicine | Roszdravnadzor licenses, telemedicine | 323-ФЗ, 38-ФЗ |
| 💰 Finance | CBR licenses, credit advertising, MFO | 353-ФЗ, 38-ФЗ |
| 🔞 Age 18+ | Age gate, age content labeling | 436-ФЗ, 394-ФЗ |
| 🌍 Geolocation | Personal data localization, foreign server | ФЗ-152, 242-ФЗ |
| 🔗 Third-party | 67+ RU/foreign services, vendor risk | ФЗ-152 |
| 🔒 Security | TLS, headers, IP reputation | OWASP, CIS |
| 📊 SEO | Metadata, canonical, robots.txt | Google Guidelines |
| 👤 People publishing | Photos without consent, third-party personal data | ФЗ-152 |
| 📱 Marketing | Prohibited claims, result guarantees, abuse | FAS, 38-ФЗ |
| 🏭 Industry-specific | Media, education, tourism, construction | 273-ФЗ, 2124-ФЗ |

### By the numbers

> Based on 965 completed audits

- **91%** of sites have violations related to personal data law (cookies or consent)
- **768** SitePravo audits completed
- **Average score:** 80/100
- **Average audit time:** 2–4 minutes

### Quick start — curl

```bash
# 1. Start audit
RESPONSE=$(curl -s -X POST https://sitepravo.ru/api/audits \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com","profile":"legal_first","consentAccepted":true,"legalBasisConfirmed":true}')

AUDIT_ID=$(echo "$RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")

# 2. Poll for result
while true; do
  RESULT=$(curl -s "https://sitepravo.ru/api/audits/$AUDIT_ID")
  STATUS=$(echo "$RESULT" | python3 -c "import sys,json; print(json.load(sys.stdin).get('status',''))")
  [ "$STATUS" = "completed" ] && break
  sleep 5
done

# 3. Print findings
echo "$RESULT" | python3 -c "
import sys, json
d = json.load(sys.stdin)
scores = d.get('scores', {})
print(f'Grade: {scores.get(\"trustGrade\",\"?\")}  Score: {scores.get(\"overall\",0)}/100')
for f in d.get('findings', [])[:5]:
    law = f.get('law', '')
    law_str = f'  ← {law}' if law else ''
    print(f'  [{f[\"severity\"]}] {f[\"category\"]}: {f[\"title\"]}{law_str}')
"
```

### GitHub Action — compliance gate in CI/CD

```yaml
# .github/workflows/legal-audit.yml
name: Legal & Compliance Audit

on:
  push:
    branches: [main]
  schedule:
    - cron: '0 10 * * 1'

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - name: SitePravo Legal Audit
        uses: Gudvin82/sitepravo@v1
        with:
          url: ${{ vars.SITE_URL }}
          profile: legal_first
          fail_on_critical: true
```

### Free online tools

| Tool | Description |
|---|---|
| [ERID Validator](https://sitepravo.ru/erid-checker/) | Validate ad ERID marker format (38-ФЗ) |
| [Cookie Checklist](https://sitepravo.ru/cookie-checklist/) | 16-point cookie banner compliance checklist |

### Knowledge base — 10 guides

Step-by-step guides for meeting Russian law requirements:
[ФЗ-152 Checklist](https://sitepravo.ru/guide/checklist-152-fz/) ·
[Cookie Banner](https://sitepravo.ru/guide/cookie-banner-kak-sdelat/) ·
[ERID Marking](https://sitepravo.ru/guide/erid-markirovka-reklamy/) ·
[Privacy Policy Template](https://sitepravo.ru/guide/politika-konfidentsialnosti-obrazec/) ·
[Public Offer Template](https://sitepravo.ru/guide/oferta-obrazec/) ·
[Consent Form](https://sitepravo.ru/guide/soglasie-na-obrabotku-pdn/) ·
[RKN Notification](https://sitepravo.ru/guide/rkn-uvedomlenie/) ·
[E-commerce ФЗ-152](https://sitepravo.ru/guide/internet-magazin-152-fz/) ·
[Publishing People](https://sitepravo.ru/guide/publikaciya-lyudej-na-sajte/) ·
[Cross-border Data Transfer](https://sitepravo.ru/guide/transgranichnaya-peredacha-pdn/)

### Client libraries

Included in this repository:

- **JavaScript / Node.js** → [`/js/sitepravo.js`](./js/sitepravo.js) (ESM, zero dependencies)
- **Python** → [`/python/sitepravo/`](./python/sitepravo/) (`requests` only)
- **curl** → [`/examples/curl_examples.sh`](./examples/curl_examples.sh)

---

## License

Apache License 2.0 — client code is open source. The audit engine runs as a cloud service.

---

<p align="center">
  <a href="https://sitepravo.ru">🌐 Запустить аудит / Run audit</a> ·
  <a href="https://sitepravo.ru/guide/">📖 Руководства / Guides</a> ·
  <a href="https://sitepravo.ru/blog/">📝 Блог / Blog</a> ·
  <a href="https://auditguard.ru">🛡️ AuditGuard (технический аудит)</a>
</p>
