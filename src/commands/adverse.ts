/**
 * compctl adverse command - Generate adverse action notice
 */

import { Command } from 'commander';
import { generateAdverseAction, ADVERSE_ACTION_REASONS } from '../lib/checks';

export function createAdverseCommand(): Command {
  const adverse = new Command('adverse')
    .description('Generate ECOA-compliant adverse action notice')
    .option('--applicant <name>', 'Applicant name', 'Applicant')
    .option('--app-date <date>', 'Application date', new Date().toISOString().split('T')[0])
    .option('--creditor <name>', 'Creditor name', 'Lender')
    .option('--creditor-address <addr>', 'Creditor address', '123 Main St')
    .option('--reasons <codes>', 'Comma-separated reason codes (1-16) or text')
    .option('--list-reasons', 'List standard adverse action reasons', false)
    .option('--format <type>', 'Output format (json|text)', 'text')
    .action(async (options) => {
      if (options.listReasons) {
        console.log('═══════════════════════════════════════════════════════════════');
        console.log('STANDARD ADVERSE ACTION REASONS');
        console.log('═══════════════════════════════════════════════════════════════');
        ADVERSE_ACTION_REASONS.forEach((reason, i) => {
          console.log(`${(i + 1).toString().padStart(2)}. ${reason}`);
        });
        console.log('═══════════════════════════════════════════════════════════════');
        return;
      }

      let reasons: string[] = [];
      if (options.reasons) {
        const parts = options.reasons.split(',');
        for (const part of parts) {
          const trimmed = part.trim();
          const num = parseInt(trimmed);
          if (!isNaN(num) && num >= 1 && num <= ADVERSE_ACTION_REASONS.length) {
            reasons.push(ADVERSE_ACTION_REASONS[num - 1]);
          } else {
            reasons.push(trimmed);
          }
        }
      }

      const notice = generateAdverseAction(
        options.applicant,
        options.appDate,
        options.creditor,
        options.creditorAddress,
        reasons
      );

      if (options.format === 'json') {
        console.log(JSON.stringify(notice, null, 2));
      } else {
        console.log('═══════════════════════════════════════════════════════════════');
        console.log('NOTICE OF ADVERSE ACTION');
        console.log('═══════════════════════════════════════════════════════════════');
        console.log('');
        console.log(`Date: ${notice.decisionDate}`);
        console.log(`To: ${notice.applicantName}`);
        console.log('');
        console.log(`Your application for credit dated ${notice.applicationDate} has been`);
        console.log('denied based on the following reason(s):');
        console.log('');
        if (notice.reasons.length > 0) {
          for (const reason of notice.reasons) {
            console.log(`  • ${reason}`);
          }
        } else {
          console.log('  [No specific reasons provided - COMPLIANCE WARNING]');
        }
        console.log('');
        console.log('───────────────────────────────────────────────────────────────');
        console.log('EQUAL CREDIT OPPORTUNITY ACT NOTICE');
        console.log('───────────────────────────────────────────────────────────────');
        console.log(notice.ecoaNotice);
        console.log('');
        console.log('───────────────────────────────────────────────────────────────');
        console.log('FAIR CREDIT REPORTING ACT NOTICE');
        console.log('───────────────────────────────────────────────────────────────');
        console.log(notice.fcraNotice);
        console.log('');
        console.log(`${notice.creditorName}`);
        console.log(`${notice.creditorAddress}`);
        console.log('═══════════════════════════════════════════════════════════════');
      }
    });

  return adverse;
}
