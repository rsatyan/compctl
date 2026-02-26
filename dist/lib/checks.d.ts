/**
 * Compliance check implementations
 */
import { LoanData, TridTiming, AtrQmResult, ComplianceCheck, AdverseActionNotice } from '../types';
/**
 * Check TRID timing requirements
 */
export declare function checkTridTiming(data: {
    applicationDate: string;
    leDisclosureDate?: string;
    cdDisclosureDate?: string;
    closingDate?: string;
}): TridTiming;
/**
 * Check ATR/QM requirements
 */
export declare function checkAtrQm(loan: LoanData): AtrQmResult;
/**
 * Check ECOA compliance and generate adverse action notice
 */
export declare function checkEcoa(loan: LoanData, decision: 'approved' | 'denied' | 'countered', reasons?: string[]): ComplianceCheck;
/**
 * Generate ECOA-compliant adverse action notice
 */
export declare function generateAdverseAction(applicantName: string, applicationDate: string, creditorName: string, creditorAddress: string, reasons: string[]): AdverseActionNotice;
/**
 * Standard adverse action reasons
 */
export declare const ADVERSE_ACTION_REASONS: string[];
//# sourceMappingURL=checks.d.ts.map