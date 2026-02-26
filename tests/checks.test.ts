import { checkTridTiming, checkAtrQm, checkEcoa, generateAdverseAction } from '../src/lib/checks';
import { LoanData } from '../src/types';

describe('checkTridTiming', () => {
  it('should pass when LE provided in time', () => {
    const today = new Date();
    const appDate = new Date();
    appDate.setDate(today.getDate() - 1);
    
    const result = checkTridTiming({
      applicationDate: appDate.toISOString().split('T')[0],
      leDisclosureDate: today.toISOString().split('T')[0],
    });
    
    expect(result.leCompliant).toBe(true);
  });

  it('should track application date', () => {
    const result = checkTridTiming({
      applicationDate: '2026-02-26',
    });
    
    expect(result.applicationDate).toBe('2026-02-26');
  });
});

describe('checkAtrQm', () => {
  const baseLoan: LoanData = {
    loanId: 'TEST-001',
    applicationDate: '2026-02-26',
    loanAmount: 300000,
    propertyValue: 375000,
    interestRate: 6.5,
    termMonths: 360,
    monthlyPayment: 1896,
    dti: 35,
    ltv: 80,
    creditScore: 720,
    pointsAndFees: 5000,
    borrowerIncome: 100000,
    propertyType: 'single-family',
    occupancy: 'primary',
    loanPurpose: 'purchase',
    loanType: 'conventional',
  };

  it('should identify QM safe harbor for compliant loan', () => {
    const result = checkAtrQm(baseLoan);
    expect(result.isQm).toBe(true);
    expect(result.qmType).toBe('safe-harbor');
  });

  it('should flag negative amortization as risky', () => {
    const loan = { ...baseLoan, negativeAmortization: true };
    const result = checkAtrQm(loan);
    expect(result.isQm).toBe(false);
    expect(result.riskyFeatures).toContain('Negative amortization');
  });

  it('should flag interest-only as risky', () => {
    const loan = { ...baseLoan, interestOnly: true };
    const result = checkAtrQm(loan);
    expect(result.isQm).toBe(false);
    expect(result.riskyFeatures).toContain('Interest-only payments');
  });

  it('should flag balloon payment as risky', () => {
    const loan = { ...baseLoan, balloonPayment: true };
    const result = checkAtrQm(loan);
    expect(result.isQm).toBe(false);
    expect(result.riskyFeatures).toContain('Balloon payment');
  });

  it('should flag excessive points and fees', () => {
    const loan = { ...baseLoan, pointsAndFees: 15000 }; // 5% of $300k
    const result = checkAtrQm(loan);
    expect(result.isQm).toBe(false);
    expect(result.findings.some(f => f.code === 'QM-PF-001')).toBe(true);
  });

  it('should flag term over 30 years', () => {
    const loan = { ...baseLoan, termMonths: 480 }; // 40 years
    const result = checkAtrQm(loan);
    expect(result.riskyFeatures).toContain('Term exceeds 30 years');
  });

  it('should identify rebuttable presumption for high DTI', () => {
    const loan = { ...baseLoan, dti: 45 };
    const result = checkAtrQm(loan);
    expect(result.isQm).toBe(true);
    expect(result.qmType).toBe('rebuttable-presumption');
  });
});

describe('checkEcoa', () => {
  const baseLoan: LoanData = {
    loanId: 'TEST-001',
    applicationDate: '2026-02-26',
    loanAmount: 300000,
    propertyValue: 375000,
    interestRate: 6.5,
    termMonths: 360,
    monthlyPayment: 1896,
    dti: 35,
    ltv: 80,
    creditScore: 720,
    pointsAndFees: 5000,
    borrowerIncome: 100000,
    propertyType: 'single-family',
    occupancy: 'primary',
    loanPurpose: 'purchase',
    loanType: 'conventional',
  };

  it('should require reasons for denial', () => {
    const result = checkEcoa(baseLoan, 'denied');
    expect(result.passed).toBe(false);
    expect(result.findings.some(f => f.code === 'ECOA-AA-001')).toBe(true);
  });

  it('should pass with reasons provided', () => {
    const result = checkEcoa(baseLoan, 'denied', ['DTI too high', 'Credit score']);
    expect(result.passed).toBe(true);
  });

  it('should pass for approvals', () => {
    const result = checkEcoa(baseLoan, 'approved');
    expect(result.passed).toBe(true);
  });
});

describe('generateAdverseAction', () => {
  it('should generate complete notice', () => {
    const notice = generateAdverseAction(
      'John Smith',
      '2026-02-26',
      'ABC Mortgage',
      '123 Main St',
      ['DTI exceeds limit', 'Credit score too low']
    );

    expect(notice.applicantName).toBe('John Smith');
    expect(notice.reasons.length).toBe(2);
    expect(notice.ecoaNotice).toContain('Equal Credit Opportunity Act');
    expect(notice.fcraNotice).toContain('credit report');
  });

  it('should limit reasons to 4', () => {
    const notice = generateAdverseAction(
      'John Smith',
      '2026-02-26',
      'ABC Mortgage',
      '123 Main St',
      ['Reason 1', 'Reason 2', 'Reason 3', 'Reason 4', 'Reason 5', 'Reason 6']
    );

    expect(notice.reasons.length).toBe(4);
  });
});
