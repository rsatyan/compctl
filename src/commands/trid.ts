/**
 * compctl trid command - Check TRID timing compliance
 */

import { Command } from 'commander';
import { checkTridTiming } from '../lib/checks';

export function createTridCommand(): Command {
  const trid = new Command('trid')
    .description('Check TRID timing compliance')
    .requiredOption('--app-date <date>', 'Application date (YYYY-MM-DD)')
    .option('--le-date <date>', 'Loan Estimate disclosure date')
    .option('--cd-date <date>', 'Closing Disclosure date')
    .option('--closing-date <date>', 'Scheduled closing date')
    .option('--format <type>', 'Output format (json|table)', 'table')
    .action(async (options) => {
      const result = checkTridTiming({
        applicationDate: options.appDate,
        leDisclosureDate: options.leDate,
        cdDisclosureDate: options.cdDate,
        closingDate: options.closingDate,
      });

      if (options.format === 'json') {
        console.log(JSON.stringify(result, null, 2));
      } else {
        console.log('═══════════════════════════════════════════════════════════════');
        console.log('TRID TIMING COMPLIANCE');
        console.log('═══════════════════════════════════════════════════════════════');
        console.log('');
        console.log(`Application Date:   ${result.applicationDate}`);
        if (result.leDisclosureDate) console.log(`LE Disclosure:      ${result.leDisclosureDate}`);
        if (result.cdDisclosureDate) console.log(`CD Disclosure:      ${result.cdDisclosureDate}`);
        if (result.closingDate) console.log(`Closing Date:       ${result.closingDate}`);
        console.log('');
        console.log('STATUS');
        console.log('───────────────────────────────────────────────────────────────');
        const leStatus = result.leCompliant ? '✓ COMPLIANT' : '✗ NON-COMPLIANT';
        const cdStatus = result.cdCompliant ? '✓ COMPLIANT' : '✗ NON-COMPLIANT';
        console.log(`Loan Estimate:      ${leStatus}`);
        if (result.daysUntilLeDeadline) {
          console.log(`  Days until deadline: ${result.daysUntilLeDeadline}`);
        }
        console.log(`Closing Disclosure: ${cdStatus}`);
        if (result.daysUntilCdDeadline) {
          console.log(`  Days until deadline: ${result.daysUntilCdDeadline}`);
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

  return trid;
}
