"""
SitePravo Python Client
Официальный клиент для API юридического аудита sitepravo.ru
"""

from .client import SitePravo, SitePravoReport, SitePravoFinding

__all__ = ['SitePravo', 'SitePravoReport', 'SitePravoFinding']
__version__ = '1.0.0'
