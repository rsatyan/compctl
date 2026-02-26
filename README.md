# compctl

Lending compliance checks for TRID, ATR/QM, HMDA, and ECOA. Part of the **LendCtl Suite**.

## Features

- **TRID Timing** — LE/CD disclosure deadline tracking
- **ATR/QM Check** — Qualified mortgage determination
- **Adverse Action** — ECOA-compliant denial notices
- **Risk Flags** — Identify compliance issues early

## Installation

```bash
npm install -g compctl
```

## Quick Start

### Check TRID Timing

```bash
compctl trid --app-date 2026-02-20 --closing-date 2026-03-15
```

### Check ATR/QM Compliance

```bash
compctl atr --loan-amount 300000 --dti 42 --points-fees 5000
```

### Generate Adverse Action Notice

```bash
# List standard reasons
compctl adverse --list-reasons

# Generate notice
compctl adverse --applicant "John Smith" --reasons "1,2,5"
```

## Commands

### `compctl trid`
Check TRID timing compliance.

Options:
- `--app-date <date>` - Application date (required)
- `--le-date <date>` - Loan Estimate disclosure date
- `--cd-date <date>` - Closing Disclosure date
- `--closing-date <date>` - Scheduled closing date

### `compctl atr`
Check ATR/QM compliance.

Options:
- `--loan-amount <amount>` - Loan amount
- `--dti <percent>` - Debt-to-income ratio
- `--points-fees <amount>` - Points and fees
- `--neg-am` - Has negative amortization
- `--interest-only` - Has interest-only period
- `--balloon` - Has balloon payment

### `compctl adverse`
Generate adverse action notice.

Options:
- `--applicant <name>` - Applicant name
- `--reasons <codes>` - Reason codes (1-16) or text
- `--list-reasons` - Show standard reasons

## Compliance Regulations

### TRID (TILA-RESPA Integrated Disclosure)
- Loan Estimate within 3 business days of application
- Closing Disclosure 3 business days before closing

### ATR/QM (Ability to Repay / Qualified Mortgage)
- No risky features (neg-am, interest-only, balloon)
- Points and fees under 3% (for loans ≥$100k)
- DTI ≤43% for safe harbor

### ECOA (Equal Credit Opportunity Act)
- Specific reasons required for adverse action
- Maximum 4 primary factors
- Standard notices required

## License

MIT © Avatar Consulting
