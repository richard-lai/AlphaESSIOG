# Alpha ESS — Octopus EV Charge Integration

This project synchronises Octopus Energy EV charge schedules (Flex planned dispatches) with an Alpha ESS battery's discharge schedule. It:

- obtains a Kraken token from Octopus Energy
- fetches planned EV charge windows for a Hypervolt device
- computes a conservative Alpha ESS discharge schedule around those charge windows (rounded to 15 minutes)
- compares the new schedule with the current Alpha ESS configuration and updates it via the Alpha API if necessary

The sync runs automatically every 5 minutes (see `src/index.ts`) but can also be run manually.

**Why**: ensure the battery does not discharge while a vehicle is planned to charge, and enable discharge outside of vehicle charging windows.

**Quick overview of important files**

- `src/index.ts` — main entry; orchestrates token fetch, schedule fetch, computes new discharge schedule and writes it to Alpha; scheduled with `node-cron` to run every 5 minutes.
- `src/lib/octopusClient.ts` — GraphQL client for Octopus Energy (obtainKrakenToken, getFlexPlannedDispatches).
- `src/lib/alphaClient.ts` — Alpha ESS API client (get/update discharge config) using a timestamped SHA-512 app signature.
- `src/lib/dischargeSchedule.ts` — core logic that converts Octopus charge slots into an Alpha ESS discharge schedule.
- `test/dischargeSchedule.test.ts` — unit tests for the schedule conversion logic (Vitest).

**Prerequisites**

- Node.js 18+ (the `package.json` declares `node >=18`)
- An Octopus Energy API key with access to the device you want to query
- Alpha ESS API credentials (app id/secret) and system serial number

Environment variables

Create a `.env` in the project root with the following keys set (example values shown):

```
ALPHA_OPEN_URL=https://open.alphaess.com/open-api
ALPHA_APP_ID=your_alpha_app_id
ALPHA_APP_SECRET=your_alpha_app_secret
ALPHA_SN=your_alpha_system_serial

OCTO_GRAPH_URL=https://api.octopus.energy/graphql
OCTO_API_KEY=your_octopus_api_key
OCTO_HYPERVOLT_DEVICE_ID=your_hypervolt_device_id
```

Make sure the values above are correct for your environment. The code reads these via `process.env`.

Install and run

Install dependencies:

```
npm install
```

Run in development (ts-node, single-run):

```
npm run dev
```

Build and run compiled output (recommended for production):

```
npm run build
npm run start
```

Tests

Run unit tests (Vitest):

```
npm run test
```

Useful scripts (from `package.json`)

- `npm run build` — compile TypeScript to `dist`
- `npm run start` — build then run `dist/index.js`
- `npm run dev` — run `src/index.ts` with `ts-node`
- `npm run test` — run tests
- `npm run validate` — build + test

How it works (summary)

1. `src/index.ts` obtains a Kraken token from Octopus using `octopusClient.obtainKrakenToken()`.
2. It queries planned EV charge windows with `octopusClient.getFlexPlannedDispatches()`.
3. `getNewDischargeSchedule` (in `src/lib/dischargeSchedule.ts`) merges and rounds charge windows to 15-minute boundaries, then produces two discharge windows for the Alpha ESS config fields (`timeDisf1/timeDise1` and `timeDisf2/timeDise2`).
4. The current Alpha config is fetched with `alphaClient.getDischargeConfigInfo()` and compared to the computed schedule. If different, `alphaClient.updateDisChargeConfigInfo()` is used to update Alpha.

Deployment notes

- This project is lightweight and can run on any machine that can reach both Octopus and Alpha APIs. For continuous production use, run it as a system service (systemd on Linux, Windows Service or Task Scheduler on Windows) or use a process manager such as `pm2`.
- Keep the `.env` file secure. Consider injecting secrets via your CI/CD or environment manager.

Troubleshooting

- If you receive errors about missing environment variables, double-check `.env` and that the process can read them.
- Alpha API errors include a JSON payload in thrown exceptions; inspect logs for details.
- If Octopus GraphQL queries fail, confirm `OCTO_API_KEY` and `OCTO_HYPERVOLT_DEVICE_ID` are correct and the API endpoint is reachable.

Extending the project

- Add logging/metrics (e.g., sentry or Prometheus) for production monitoring.
- Add more robust retry/backoff for network requests.
- Add rate limiting and improved error handling around Alpha/Octopus API calls.

License

See `LICENSE` in this repository.

# Node + TypeScript Boilerplate

Minimal Node.js + TypeScript project scaffold with build and test configured.

Scripts:
- npm run build — compile TypeScript to `dist`
- npm run start — run compiled code
- npm run dev — run with ts-node
- npm run test — run tests (vitest)

Quick start:

1. npm install
2. npm run build
3. npm run start
