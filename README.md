# Rialo AutoPay

**Exploring programmable payment workflows in the Rialo ecosystem.**

Rialo AutoPay is an experimental developer project exploring how recurring payment workflows can be configured through a web interface and Rialo-related program components.

The project focuses on payment configuration, wallet integration, and a Daily AutoPay preview experience.

> [!IMPORTANT]
> **Experimental prototype:** The Daily AutoPay preview does not itself broadcast transactions or guarantee automatic recurring payments. Full on-chain execution and scheduling must be verified separately.

## Features

- Web-based payment configuration
- Daily AutoPay preview without broadcasting a transaction
- Rialo-related wallet and network integration
- Rust program and client components
- WebAssembly component interface exploration
- A foundation for future recurring-payment workflows

## Technology Stack

- **Rust** — program and client components
- **JavaScript** — frontend application logic
- **HTML and CSS** — web interface
- **Vite** — frontend development and build tooling
- **Rialo Frost SDK** — Rialo-related frontend integration
- **WebAssembly and WIT** — component interface integration

## Architecture

```text
rialo-autopay/
├── artifact/                       # Rust program component
├── web-client/
│   └── rialo-autopay-client/       # Rust client component
├── web/                            # Web frontend
│   ├── api/
│   ├── src/
│   └── package.json
├── wit/                            # Interface definitions
├── Cargo.toml
├── Cargo.lock
├── .gitignore
└── README.md
## Getting Started

### Prerequisites

- Node.js and npm
- Rust and Cargo
- Rialo development tools required by the relevant components

### Run the Frontend

```bash
cd web
npm ci
npm run build
npx vite
cargo metadata --no-deps

## Roadmap

- [x] Project structure established
- [x] Web interface developed
- [x] Daily AutoPay preview workflow
- [ ] Verify wallet and transaction integration
- [ ] Validate deployment and frontend interaction
- [ ] Implement persistent recurring-payment execution
- [ ] Add transaction history and error handling
- [ ] Complete security testing

## Security

This project is experimental and is not intended for production use.

- Never commit private keys, seed phrases, access tokens, or secret environment files.
- Verify the recipient, amount, and network before signing transactions.
- Test on a development network first.
- A preview is not proof that a payment has executed.

## Contributing

Contributions and feedback are welcome. Test changes before opening a pull request. Never include secrets in commits.

## Disclaimer

Rialo AutoPay is an experimental developer project. Transaction execution and production readiness must be independently verified.
