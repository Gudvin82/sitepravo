/**
 * SitePravo JavaScript/Node.js Client
 * Официальный клиент для API юридического аудита
 * https://sitepravo.ru
 *
 * @license Apache-2.0
 */

const BASE_URL = 'https://sitepravo.ru/api';
const DEFAULT_TIMEOUT_MS = 30_000;
const POLL_INTERVAL_MS = 5_000;
const MAX_WAIT_MS = 300_000; // 5 min

export class SitePravoFinding {
  constructor(data) {
    this.id = data.id ?? '';
    this.category = data.category ?? '';
    this.severity = data.severity ?? 'medium'; // critical | high | medium | low
    this.title = data.title ?? '';
    this.where = data.where ?? '';
    this.whyRisk = data.whyRisk ?? '';
    this.fix = data.fix ?? '';
    this.confidence = data.confidence ?? 1.0;
    this.raw = data;
  }
}

export class SitePravoReport {
  constructor(data) {
    this.id = data.id ?? '';
    this.url = data.url ?? '';
    this.grade = data.grade ?? '?';
    this.score = data.score ?? 0;
    this.findings = (data.findings ?? []).map(f => new SitePravoFinding(f));
    this.summary = data.summary ?? {};
    this.checkedAt = data.checkedAt ?? '';
    this.aiReviewLog = data.aiReviewLog ?? [];
    this.raw = data;
  }

  get criticalFindings() {
    return this.findings.filter(f => f.severity === 'critical');
  }

  get highFindings() {
    return this.findings.filter(f => f.severity === 'high');
  }

  get totalFindings() {
    return this.findings.length;
  }

  findingsByCategory(category) {
    return this.findings.filter(f => f.category === category);
  }
}

export class SitePravoError extends Error {
  constructor(message, statusCode = null) {
    super(message);
    this.name = 'SitePravoError';
    this.statusCode = statusCode;
  }
}

export class SitePravo {
  /**
   * @param {Object} options
   * @param {string} [options.apiKey]      — API-ключ (необязателен для публичного API)
   * @param {string} [options.baseUrl]     — базовый URL (по умолчанию https://sitepravo.ru/api)
   * @param {number} [options.timeoutMs]   — таймаут HTTP-запроса
   */
  constructor({ apiKey, baseUrl, timeoutMs } = {}) {
    this.apiKey = apiKey ?? null;
    this.baseUrl = (baseUrl ?? BASE_URL).replace(/\/$/, '');
    this.timeoutMs = timeoutMs ?? DEFAULT_TIMEOUT_MS;
  }

  _headers() {
    const h = { 'Content-Type': 'application/json' };
    if (this.apiKey) h['Authorization'] = `Bearer ${this.apiKey}`;
    return h;
  }

  async _fetch(path, options = {}) {
    const url = `${this.baseUrl}${path}`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const res = await fetch(url, {
        ...options,
        headers: { ...this._headers(), ...(options.headers ?? {}) },
        signal: controller.signal,
      });

      if (!res.ok) {
        let body = '';
        try { body = await res.text(); } catch (_) {}
        throw new SitePravoError(
          `HTTP ${res.status}: ${body.slice(0, 200)}`,
          res.status
        );
      }

      return res.json();
    } catch (err) {
      if (err.name === 'AbortError') {
        throw new SitePravoError(`Таймаут запроса (${this.timeoutMs}мс)`);
      }
      throw err;
    } finally {
      clearTimeout(timer);
    }
  }

  /**
   * Запустить аудит. Возвращает audit ID.
   * @param {string} url
   * @param {string} [profile='legal_first']
   * @returns {Promise<string>}
   */
  async startAudit(url, profile = 'legal_first') {
    const data = await this._fetch('/audits', {
      method: 'POST',
      body: JSON.stringify({ url, profile, consentAccepted: true, legalBasisConfirmed: true }),
    });
    return data.id;
  }

  /**
   * Получить результат по ID.
   * @param {string} auditId
   * @returns {Promise<Object>}
   */
  async getAudit(auditId) {
    return this._fetch(`/audits/${auditId}`);
  }

  /**
   * Запустить аудит и дождаться результата.
   *
   * @param {string} url                — URL сайта
   * @param {Object} [options]
   * @param {string} [options.profile]  — legal_first | technical_first
   * @param {number} [options.pollMs]   — интервал опроса мс
   * @param {number} [options.maxWaitMs] — максимальное ожидание мс
   * @param {Function} [options.onProgress] — callback(status, elapsed)
   * @returns {Promise<SitePravoReport>}
   */
  async audit(url, { profile = 'legal_first', pollMs = POLL_INTERVAL_MS, maxWaitMs = MAX_WAIT_MS, onProgress } = {}) {
    const auditId = await this.startAudit(url, profile);
    const start = Date.now();

    while (true) {
      const elapsed = Date.now() - start;
      if (elapsed > maxWaitMs) {
        throw new SitePravoError(`Таймаут ожидания аудита ${auditId} (${maxWaitMs / 1000}с)`);
      }

      const data = await this.getAudit(auditId);
      const { status } = data;

      if (onProgress) onProgress(status, elapsed);

      if (status === 'completed') {
        return new SitePravoReport(data);
      } else if (status === 'failed') {
        throw new SitePravoError(`Аудит ${auditId} завершился с ошибкой: ${data.error ?? 'unknown'}`);
      }

      await new Promise(r => setTimeout(r, pollMs));
    }
  }
}

export default SitePravo;
