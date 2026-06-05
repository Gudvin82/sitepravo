#!/usr/bin/env python3
"""
Пакетная проверка списка URL.
Запускает все аудиты параллельно, затем собирает результаты.
"""
import sys
import time
import threading
sys.path.insert(0, '..')

from sitepravo import SitePravo, SitePravoError

URLS = [
    "https://example.com",
    "https://example.org",
    "https://example.net",
]

def audit_url(client, url, results):
    try:
        report = client.audit(url)
        results[url] = report
        print(f"  ✓ {url} — Grade: {report.grade}, Score: {report.score}")
    except SitePravoError as e:
        results[url] = None
        print(f"  ✗ {url} — Ошибка: {e}")

def main():
    urls = sys.argv[1:] if len(sys.argv) > 1 else URLS

    client = SitePravo()
    results = {}
    threads = []

    print(f"Запуск аудита {len(urls)} сайтов...")
    for url in urls:
        t = threading.Thread(target=audit_url, args=(client, url, results))
        t.start()
        threads.append(t)
        time.sleep(0.5)  # небольшая задержка между запусками

    for t in threads:
        t.join()

    print(f"\n{'='*60}")
    print("ИТОГИ:")
    failed = [u for u, r in results.items() if r is None]
    ok = [(u, r) for u, r in results.items() if r is not None]

    ok.sort(key=lambda x: x[1].score, reverse=True)
    for url, report in ok:
        critical = report.summary.get('critical', 0)
        flag = "🚨" if critical > 0 else ("✅" if report.score >= 85 else "⚠️")
        print(f"  {flag} {report.grade} ({report.score:3d}) — {url} | critical: {critical}")

    if failed:
        print(f"\nОшибки ({len(failed)}):")
        for url in failed:
            print(f"  ✗ {url}")

if __name__ == "__main__":
    main()
