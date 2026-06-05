export interface Finding {
  id: string;
  category: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  where: string;
  whyRisk: string;
  fix: string;
  confidence: number;
  raw: Record<string, unknown>;
}

export interface ReportSummary {
  critical: number;
  high: number;
  medium: number;
  low: number;
}

export interface AuditOptions {
  profile?: 'legal_first' | 'technical_first';
  pollMs?: number;
  maxWaitMs?: number;
  onProgress?: (status: string, elapsedMs: number) => void;
}

export interface ClientOptions {
  apiKey?: string;
  baseUrl?: string;
  timeoutMs?: number;
}

export class SitePravoFinding implements Finding {
  id: string;
  category: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  where: string;
  whyRisk: string;
  fix: string;
  confidence: number;
  raw: Record<string, unknown>;
}

export class SitePravoReport {
  id: string;
  url: string;
  grade: string;
  score: number;
  findings: SitePravoFinding[];
  summary: ReportSummary;
  checkedAt: string;
  aiReviewLog: unknown[];
  raw: Record<string, unknown>;

  get criticalFindings(): SitePravoFinding[];
  get highFindings(): SitePravoFinding[];
  get totalFindings(): number;
  findingsByCategory(category: string): SitePravoFinding[];
}

export class SitePravoError extends Error {
  statusCode: number | null;
}

export class SitePravo {
  constructor(options?: ClientOptions);
  startAudit(url: string, profile?: string): Promise<string>;
  getAudit(auditId: string): Promise<Record<string, unknown>>;
  audit(url: string, options?: AuditOptions): Promise<SitePravoReport>;
}

export default SitePravo;
