# sitepravo — Python Client

```bash
pip install requests
```

```python
from sitepravo import SitePravo

client = SitePravo()
report = client.audit("https://example.com")

print(f"Grade: {report.grade}  Score: {report.score}/100")
print(f"Findings: {report.total_findings} (critical: {len(report.critical_findings)})")

for f in report.critical_findings:
    print(f"\n[{f.severity.upper()}] {f.category}: {f.title}")
    print(f"  Риск: {f.why_risk[:120]}...")
    print(f"  Исправление: {f.fix[:120]}...")
```

See the [root README](../README.md) for full API documentation.
