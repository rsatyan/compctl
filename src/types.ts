/**
 * Compliance types for compctl
 */

/** Regulation identifiers */
export type Regulation = 
  | 'TRID' | 'ATR_QM' | 'HMDA' | 'ECOA' | 'RESPA' 
  | 'TILA' | 'FCRA' | 'UDAAP' | 'SCRA' | 'FLOOD';

/** Compliance check result */
export interface ComplianceCheck {
  regulation: Regulation;
  passed: boolean;
  findings: Finding[];
  warnings: string[];
  recommendations: string[];
}

/** Individual finding */
export interface Finding {
  code: string;
  severity: 'critical' | 'major' | 'minor' | 'info';
  description: string;
  remediation?: string;
}

/** TRID timing check */
export interface TridTiming {
  applicationDate: string;
  leDisclosureDate?: string;
  cdDisclosureDate?: string;
  closingDate?: string;
  leCompliant: boolean;
  cdCompliant: boolean;
  daysUntilLeDeadline?: number;
  daysUntilCdDeadline?: number;
  findings: Finding[];
}

/** ATR/QM check result */
export interface AtrQmResult {
  isQm: boolean;
  qmType?: 'safe-harbor' | 'rebuttable-presumption' | 'non-qm';
  dti: number;
  dtiLimit: number;
  pointsAndFees: number;
  pointsAndFeesLimit: number;
  hasRiskyFeatures: boolean;
  riskyFeatures: string[];
  findings: Finding[];
}

/** HMDA LAR data */
export interface HmdaLarData {
  loanId: string;
  actionTaken: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
  actionTakenDate: string;
  loanType: 1 | 2 | 3 | 4;
  loanPurpose: 1 | 2 | 31 | 32 | 4 | 5;
  lienStatus: 1 | 2;
  loanAmount: number;
  combinedLtv?: number;
  interestRate?: number;
  rateSpread?: number;
  hoepaStatus: 1 | 2 | 3;
  propertyType: 1 | 2 | 3;
  constructionMethod: 1 | 2;
  occupancyType: 1 | 2 | 3;
  propertyValue?: number;
  applicantEthnicity: string[];
  applicantRace: string[];
  applicantSex: 1 | 2 | 3 | 4;
  applicantAge?: number;
  income?: number;
  creditScore?: number;
  dti?: number;
  ausResult?: string;
}

/** Adverse action reasons */
export interface AdverseActionNotice {
  applicantName: string;
  applicationDate: string;
  decisionDate: string;
  creditorName: string;
  creditorAddress: string;
  reasons: string[];
  ecoaNotice: string;
  fcraNotice?: string;
}

/** Loan data for compliance checks */
export interface LoanData {
  loanId: string;
  applicationDate: string;
  loanAmount: number;
  propertyValue: number;
  interestRate: number;
  termMonths: number;
  monthlyPayment: number;
  dti: number;
  ltv: number;
  creditScore: number;
  pointsAndFees: number;
  prepaymentPenalty?: boolean;
  negativeAmortization?: boolean;
  interestOnly?: boolean;
  balloonPayment?: boolean;
  armFeatures?: { initialRate: number; margin: number; caps: number[] };
  borrowerIncome: number;
  propertyType: string;
  occupancy: string;
  loanPurpose: string;
  loanType: string;
}
