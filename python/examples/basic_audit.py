#!/usr/bin/env python3
"""
Базовый пример: запуск аудита и вывод критических находок.
"""
import sys
sys.path.insert(0, '..')

from sitepravo import SitePravo

def main():
    url = sys.argv[1] if len(sys.argv) > 1 else "https://example.com"

    print(f"Запуск аудита: {url}")
    client = SitePravo()
    report = client.audit(url)

    print(f"\n{'='*60}")
    print(f"URL:   {report.url}")
    print(f"Grade: {report.grade}  Score: {report.score}/100")
    print(f"Всего находок: {report.total_findings}")
    print(f"  critical: {report.summary.get('critical', 0)}")
    print(f"  high:     {report.summary.get('high', 0)}")
    print(f"  medium:   {report.summary.get('medium', 0)}")
    print(f"  low:      {report.summary.get('low', 0)}")
    print(f"Проверено: {report.checked_at}")
    print(f"{'='*60}\n")

    if report.critical_findings:
        print("🚨 КРИТИЧЕСКИЕ НАРУШЕНИЯ:")
        for f in report.critical_findings:
            print(f"\n  [{f.id}] {f.title}")
            print(f"  Где: {f.where}")
            print(f"  Риск: {f.why_risk[:200]}")
            print(f"  Исправить: {f.fix[:200]}")
    else:
        print("✅ Критических нарушений не найдено")

    if report.high_findings:
        print(f"\n⚠️  ВЫСОКИЙ ПРИОРИТЕТ ({len(report.high_findings)} шт.):")
        for f in report.high_findings[:5]:
            print(f"  - [{f.category}] {f.title}")


if __name__ == "__main__":
    main()
