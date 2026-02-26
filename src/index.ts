#!/usr/bin/env node

/**
 * compctl - Lending compliance checks
 * Part of the LendCtl Suite
 */

import { Command } from 'commander';
import { createTridCommand } from './commands/trid';
import { createAtrCommand } from './commands/atr';
import { createAdverseCommand } from './commands/adverse';

const program = new Command();

program
  .name('compctl')
  .description('Lending compliance checks (TRID, ATR/QM, HMDA, ECOA) - part of the LendCtl Suite')
  .version('0.1.0');

program.addCommand(createTridCommand());
program.addCommand(createAtrCommand());
program.addCommand(createAdverseCommand());

program.parse();

export * from './lib/checks';
export * from './types';
