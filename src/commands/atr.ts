/**
 * compctl atr command - Check ATR/QM compliance
 */

import { Command } from 'commander';
import * as fs from 'fs';
import { checkAtrQm } from '../lib/checks';
import { LoanData } from '../types';

export function createAtrCommand(): Command {
  const atr = new Command('atr')
    .description('Check ATR/QM compliance')
    .option('-f, --file <path>', 'Loan data JSON file')
    .option('--loan-amount <amount>', 'Loan amount')
    .option('--dti <percent>', 'Debt-to-income ratio')
    .option('--points-fees <amount>', 'Total points and fees')
    .option('--neg-am', 'Has negative amortization', false)
    .option('--interest-only', 'Has interest-only period', false)
    .option('--balloon', 'Has balloon payment', false)
    .option('--prepay-penalty', 'Has prepayment penalty', false)
    .option('--term <months>', 'Loan term in months', '360')
    .option('--format <type>', 'Output format (json|table)', 'table')
    .action(async (options) => {
      let loan: LoanData;

      if (options.file) {
        const content = fs.readFileSync(options.file, 'utf-8');
        loan = JSON.parse(content);
      } else {
        loan = {
          loanId: 'CLI-INPUT',
          applicationDate: new Date().toISOString().split('T')[0],
          loanAmount: parseFloat(options.loanAmount || '300000'),
          propertyValue: parseFloat(options.loanAmount || '300000') * 1.25,
          interestRate: 6.5,
          termMonths: parseInt(options.term),
          monthlyPayment: 0,
          dti: parseFloat(options.dti || '35'),
          ltv: 80,
          creditScore: 720,
          pointsAndFees: parseFloat(options.pointsFees || '0'),
          negativeAmortization: options.negAm,
          interestOnly: options.interestOnly,
          balloonPayment: options.balloon,
          prepaymentPenalty: options.prepayPenalty,
          borrowerIncome: 100000,
          propertyType: 'single-family',
          occupancy: 'primary',
          loanPurpose: 'purchase',
          loanType: 'conventional',
        };
      }

      const result = checkAtrQm(loan);

      if (options.format === 'json') {
        console.log(JSON.stringify(result, null, 2));
      } else {
        console.log('═══════════════════════════════════════════════════════════════');
        console.log('ATR/QM COMPLIANCE CHECK');
        console.log('═══════════════════════════════════════════════════════════════');
        console.log('');
        const qmStatus = result.isQm ? '✓ QUALIFIED MORTGAGE' : '✗ NON-QM';
        console.log(`QM Status:          ${qmStatus}`);
        if (result.qmType) {
          console.log(`QM Type:            ${result.qmType.toUpperCase()}`);
        }
        console.log('');
        console.log('KEY METRICS');
        console.log('───────────────────────────────────────────────────────────────');
        const dtiStatus = result.dti <= result.dtiLimit ? '✓' : '⚠';
        console.log(`${dtiStatus} DTI:               ${result.dti}% (limit: ${result.dtiLimit}%)`);
        const pfStatus = result.pointsAndFees <= result.pointsAndFeesLimit ? '✓' : '✗';
        console.log(`${pfStatus} Points & Fees:     $${result.pointsAndFees.toLocaleString()} (limit: $${result.pointsAndFeesLimit.toLocaleString()})`);
        
        if (result.riskyFeatures.length > 0) {
          console.log('');
          console.log('RISKY FEATURES');
          console.log('───────────────────────────────────────────────────────────────');
          for (const feature of result.riskyFeatures) {
            console.log(`  ✗ ${feature}`);
          }
        }

        if (result.findings.length > 0) {
          console.log('');
          console.log('FINDINGS');
          console.log('───────────────────────────────────────────────────────────────');
          for (const f of result.findings) {
            const icon = f.severity === 'critical' ? '🚨' : f.severity === 'major' ? '⚠' : 'ℹ';
            console.log(`${icon} [${f.code}] ${f.description}`);
            if (f.remediation) console.log(`   → ${f.remediation}`);
          }
        }
        console.log('═══════════════════════════════════════════════════════════════');
      }
    });

  return atr;
}
