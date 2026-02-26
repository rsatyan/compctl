/**
 * Compliance check implementations
 */

import { LoanData, TridTiming, AtrQmResult, Finding, ComplianceCheck, AdverseActionNotice } from '../types';

/**
 * Check TRID timing requirements
 */
export function checkTridTiming(data: {
  applicationDate: string;
  leDisclosureDate?: string;
  cdDisclosureDate?: string;
  closingDate?: string;
}): TridTiming {
  const findings: Finding[] = [];
  const appDate = new Date(data.applicationDate);
  const today = new Date();
  
  // LE must be provided within 3 business days of application
  const leDeadline = addBusinessDays(appDate, 3);
  const daysUntilLeDeadline = businessDaysBetween(today, leDeadline);
  
  let leCompliant = true;
  if (data.leDisclosureDate) {
    const leDate = new Date(data.leDisclosureDate);
    if (leDate > leDeadline) {
      leCompliant = false;
      findings.push({
        code: 'TRID-LE-001',
        severity: 'critical',
        description: 'Loan Estimate not provided within 3 business days',
        remediation: 'Issue LE immediately and document reason for delay',
      });
    }
  } else if (daysUntilLeDeadline < 0) {
    leCompliant = false;
    findings.push({
      code: 'TRID-LE-002',
      severity: 'critical',
      description: 'Loan Estimate deadline has passed',
      remediation: 'Issue LE immediately',
    });
  }

  // CD must be provided at least 3 business days before closing
  let cdCompliant = true;
  let daysUntilCdDeadline: number | undefined;
  
  if (data.closingDate) {
    const closingDate = new Date(data.closingDate);
    const cdDeadline = subtractBusinessDays(closingDate, 3);
    daysUntilCdDeadline = businessDaysBetween(today, cdDeadline);
    
    if (data.cdDisclosureDate) {
      const cdDate = new Date(data.cdDisclosureDate);
      if (cdDate > cdDeadline) {
        cdCompliant = false;
        findings.push({
          code: 'TRID-CD-001',
          severity: 'critical',
          description: 'Closing Disclosure not provided 3 business days before closing',
          remediation: 'Reschedule closing or document consumer waiver',
        });
      }
    } else if (daysUntilCdDeadline !== undefined && daysUntilCdDeadline < 0) {
      cdCompliant = false;
      findings.push({
        code: 'TRID-CD-002',
        severity: 'critical',
        description: 'CD deadline has passed for scheduled closing',
        remediation: 'Issue CD immediately or reschedule closing',
      });
    }
  }

  return {
    applicationDate: data.applicationDate,
    leDisclosureDate: data.leDisclosureDate,
    cdDisclosureDate: data.cdDisclosureDate,
    closingDate: data.closingDate,
    leCompliant,
    cdCompliant,
    daysUntilLeDeadline: daysUntilLeDeadline > 0 ? daysUntilLeDeadline : undefined,
    daysUntilCdDeadline: daysUntilCdDeadline !== undefined && daysUntilCdDeadline > 0 ? daysUntilCdDeadline : undefined,
    findings,
  };
}

/**
 * Check ATR/QM requirements
 */
export function checkAtrQm(loan: LoanData): AtrQmResult {
  const findings: Finding[] = [];
  const riskyFeatures: string[] = [];
  
  // Check for risky features that disqualify QM
  if (loan.negativeAmortization) {
    riskyFeatures.push('Negative amortization');
  }
  if (loan.interestOnly) {
    riskyFeatures.push('Interest-only payments');
  }
  if (loan.balloonPayment) {
    riskyFeatures.push('Balloon payment');
  }
  if (loan.prepaymentPenalty) {
    riskyFeatures.push('Prepayment penalty');
  }
  if (loan.termMonths > 360) {
    riskyFeatures.push('Term exceeds 30 years');
  }

  // Points and fees limit (3% for loans >= $100k)
  const pointsAndFeesLimit = loan.loanAmount >= 100000 
    ? loan.loanAmount * 0.03 
    : Math.min(loan.loanAmount * 0.03, 3000);
  
  const pointsAndFeesExceeded = loan.pointsAndFees > pointsAndFeesLimit;
  if (pointsAndFeesExceeded) {
    riskyFeatures.push('Points and fees exceed limit');
    findings.push({
      code: 'QM-PF-001',
      severity: 'critical',
      description: `Points and fees ($${loan.pointsAndFees}) exceed ${(pointsAndFeesLimit).toFixed(0)} limit`,
      remediation: 'Reduce fees or document as non-QM',
    });
  }

  // DTI check
  const dtiLimit = 43;
  const dtiExceeded = loan.dti > dtiLimit;
  if (dtiExceeded) {
    findings.push({
      code: 'QM-DTI-001',
      severity: 'major',
      description: `DTI (${loan.dti}%) exceeds QM safe harbor limit (${dtiLimit}%)`,
      remediation: 'May still qualify with AUS approval or as non-QM',
    });
  }

  // Determine QM status
  const hasRiskyFeatures = riskyFeatures.length > 0;
  let isQm = !hasRiskyFeatures && !pointsAndFeesExceeded;
  let qmType: AtrQmResult['qmType'];

  if (isQm) {
    if (loan.dti <= 43) {
      qmType = 'safe-harbor';
    } else {
      qmType = 'rebuttable-presumption';
      isQm = true; // Still QM but not safe harbor
    }
  } else {
    qmType = 'non-qm';
  }

  return {
    isQm,
    qmType,
    dti: loan.dti,
    dtiLimit,
    pointsAndFees: loan.pointsAndFees,
    pointsAndFeesLimit,
    hasRiskyFeatures,
    riskyFeatures,
    findings,
  };
}

/**
 * Check ECOA compliance and generate adverse action notice
 */
export function checkEcoa(loan: LoanData, decision: 'approved' | 'denied' | 'countered', reasons?: string[]): ComplianceCheck {
  const findings: Finding[] = [];
  const warnings: string[] = [];

  if (decision === 'denied' || decision === 'countered') {
    if (!reasons || reasons.length === 0) {
      findings.push({
        code: 'ECOA-AA-001',
        severity: 'critical',
        description: 'Adverse action requires specific reasons',
        remediation: 'Provide specific reasons for denial',
      });
    } else if (reasons.length > 4) {
      warnings.push('Best practice: limit adverse action reasons to 4 primary factors');
    }
  }

  return {
    regulation: 'ECOA',
    passed: findings.filter(f => f.severity === 'critical').length === 0,
    findings,
    warnings,
    recommendations: ['Document all adverse action reasons contemporaneously'],
  };
}

/**
 * Generate ECOA-compliant adverse action notice
 */
export function generateAdverseAction(
  applicantName: string,
  applicationDate: string,
  creditorName: string,
  creditorAddress: string,
  reasons: string[]
): AdverseActionNotice {
  return {
    applicantName,
    applicationDate,
    decisionDate: new Date().toISOString().split('T')[0],
    creditorName,
    creditorAddress,
    reasons: reasons.slice(0, 4), // Max 4 reasons
    ecoaNotice: `The federal Equal Credit Opportunity Act prohibits creditors from discriminating against credit applicants on the basis of race, color, religion, national origin, sex, marital status, age (provided the applicant has the capacity to enter into a binding contract); because all or part of the applicant's income derives from any public assistance program; or because the applicant has in good faith exercised any right under the Consumer Credit Protection Act. The federal agency that administers compliance with this law concerning this creditor is: Consumer Financial Protection Bureau, 1700 G Street NW, Washington, DC 20552.`,
    fcraNotice: `You have the right to obtain a free copy of your credit report from the credit reporting agency that provided information used in this decision. You also have the right to dispute the accuracy or completeness of any information in your credit report.`,
  };
}

/**
 * Standard adverse action reasons
 */
export const ADVERSE_ACTION_REASONS = [
  'Credit score does not meet minimum requirements',
  'Debt-to-income ratio exceeds guidelines',
  'Insufficient credit history',
  'Delinquent past or present credit obligations',
  'Collection action or judgment',
  'Bankruptcy',
  'Insufficient income for amount requested',
  'Unable to verify employment',
  'Unable to verify income',
  'Length of employment',
  'Insufficient property value',
  'Property type not eligible',
  'Loan-to-value ratio exceeds guidelines',
  'Unacceptable collateral',
  'Unable to verify residence',
  'Temporary or irregular employment',
];

// Helper functions
function addBusinessDays(date: Date, days: number): Date {
  const result = new Date(date);
  let added = 0;
  while (added < days) {
    result.setDate(result.getDate() + 1);
    if (result.getDay() !== 0 && result.getDay() !== 6) {
      added++;
    }
  }
  return result;
}

function subtractBusinessDays(date: Date, days: number): Date {
  const result = new Date(date);
  let subtracted = 0;
  while (subtracted < days) {
    result.setDate(result.getDate() - 1);
    if (result.getDay() !== 0 && result.getDay() !== 6) {
      subtracted++;
    }
  }
  return result;
}

function businessDaysBetween(start: Date, end: Date): number {
  let count = 0;
  const current = new Date(start);
  while (current < end) {
    if (current.getDay() !== 0 && current.getDay() !== 6) {
      count++;
    }
    current.setDate(current.getDate() + 1);
  }
  return count;
}
