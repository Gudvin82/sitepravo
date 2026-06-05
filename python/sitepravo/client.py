"""
SitePravo Python Client
https://sitepravo.ru
"""

import time
import requests
from dataclasses import dataclass, field
from typing import List, Optional, Dict, Any

BASE_URL = "https://sitepravo.ru/api"
DEFAULT_TIMEOUT = 30
POLL_INTERVAL = 5
MAX_WAIT = 300  # 5 minutes


@dataclass
class SitePravoFinding:
    id: str
    category: str
    severity: str  # critical | high | medium | low
    title: str
    where: str
    why_risk: str = ""
    fix: str = ""
    confidence: float = 1.0
    raw: Dict[str, Any] = field(default_factory=dict)

    @classmethod
    def from_dict(cls, data: dict) -> "SitePravoFinding":
        return cls(
            id=data.get("id", ""),
            category=data.get("category", ""),
            severity=data.get("severity", "medium"),
            title=data.get("title", ""),
            where=data.get("where", ""),
            why_risk=data.get("whyRisk", ""),
            fix=data.get("fix", ""),
            confidence=data.get("confidence", 1.0),
            raw=data,
        )


@dataclass
class SitePravoReport:
    id: str
    url: str
    grade: str
    score: int
    findings: List[SitePravoFinding]
    summary: Dict[str, int]
    checked_at: str
    raw: Dict[str, Any] = field(default_factory=dict)

    @property
    def critical_findings(self) -> List[SitePravoFinding]:
        return [f for f in self.findings if f.severity == "critical"]

    @property
    def high_findings(self) -> List[SitePravoFinding]:
        return [f for f in self.findings if f.severity == "high"]

    @property
    def total_findings(self) -> int:
        return len(self.findings)

    def findings_by_category(self, category: str) -> List[SitePravoFinding]:
        return [f for f in self.findings if f.category == category]

    @classmethod
    def from_dict(cls, data: dict) -> "SitePravoReport":
        return cls(
            id=data.get("id", ""),
            url=data.get("url", ""),
            grade=data.get("grade", "?"),
            score=data.get("score", 0),
            findings=[SitePravoFinding.from_dict(f) for f in data.get("findings", [])],
            summary=data.get("summary", {}),
            checked_at=data.get("checkedAt", ""),
            raw=data,
        )


class SitePravoError(Exception):
    pass


class SitePravo:
    """
    Клиент API SitePravo — юридический и compliance-аудит сайтов.

    Пример:
        client = SitePravo()
        report = client.audit("https://example.com")
        print(f"Grade: {report.grade}, Score: {report.score}")
    """

    def __init__(
        self,
        api_key: Optional[str] = None,
        base_url: str = BASE_URL,
        timeout: int = DEFAULT_TIMEOUT,
    ):
        self.api_key = api_key
        self.base_url = base_url.rstrip("/")
        self.timeout = timeout
        self._session = requests.Session()
        self._session.headers.update({"Content-Type": "application/json"})
        if api_key:
            self._session.headers.update({"Authorization": f"Bearer {api_key}"})

    def start_audit(self, url: str, profile: str = "legal_first") -> str:
        """Запустить аудит. Возвращает audit ID."""
        resp = self._session.post(
            f"{self.base_url}/audits",
            json={"url": url, "profile": profile, "agreeToTerms": True, "hasLegalBasis": True},
            timeout=self.timeout,
        )
        resp.raise_for_status()
        data = resp.json()
        return data["id"]

    def get_audit(self, audit_id: str) -> Dict[str, Any]:
        """Получить результат аудита по ID."""
        resp = self._session.get(
            f"{self.base_url}/audits/{audit_id}",
            timeout=self.timeout,
        )
        resp.raise_for_status()
        return resp.json()

    def audit(
        self,
        url: str,
        profile: str = "legal_first",
        poll_interval: int = POLL_INTERVAL,
        max_wait: int = MAX_WAIT,
    ) -> SitePravoReport:
        """
        Запустить аудит и дождаться результата.

        Args:
            url: URL сайта для проверки
            profile: профиль аудита (legal_first / technical_first)
            poll_interval: интервал опроса в секундах
            max_wait: максимальное время ожидания в секундах

        Returns:
            SitePravoReport с результатами аудита

        Raises:
            SitePravoError: при ошибке API или таймауте
        """
        audit_id = self.start_audit(url, profile)
        start = time.time()

        while True:
            elapsed = time.time() - start
            if elapsed > max_wait:
                raise SitePravoError(
                    f"Таймаут ожидания аудита {audit_id} после {max_wait}с"
                )

            data = self.get_audit(audit_id)
            status = data.get("status")

            if status == "completed":
                return SitePravoReport.from_dict(data)
            elif status == "failed":
                raise SitePravoError(
                    f"Аудит {audit_id} завершился с ошибкой: {data.get('error', 'unknown')}"
                )

            time.sleep(poll_interval)
