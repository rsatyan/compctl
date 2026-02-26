#!/usr/bin/env node
"use strict";
/**
 * compctl - Lending compliance checks
 * Part of the LendCtl Suite
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const trid_1 = require("./commands/trid");
const atr_1 = require("./commands/atr");
const adverse_1 = require("./commands/adverse");
const program = new commander_1.Command();
program
    .name('compctl')
    .description('Lending compliance checks (TRID, ATR/QM, HMDA, ECOA) - part of the LendCtl Suite')
    .version('0.1.0');
program.addCommand((0, trid_1.createTridCommand)());
program.addCommand((0, atr_1.createAtrCommand)());
program.addCommand((0, adverse_1.createAdverseCommand)());
program.parse();
__exportStar(require("./lib/checks"), exports);
__exportStar(require("./types"), exports);
//# sourceMappingURL=index.js.map