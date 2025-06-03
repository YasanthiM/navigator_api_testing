# Playwright API Testing Framework

This repository contains automated API tests using Playwright Test framework.

## Prerequisites

- Node.js (Latest LTS version recommended)
- npm (comes with Node.js)

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd Navigator_API_Testing
```

2. Install dependencies:
```bash
npm install
```

## Project Structure

- `/tests` - Contains test files
- `/playwright-report` - Test execution reports
- `/test-results` - Test results and artifacts
- `playwright.config.js` - Playwright configuration file

## Running Tests

To run all tests:
```bash
npx playwright test
```

To run tests with UI mode:
```bash
npx playwright test --ui
```

To run a specific test file:
```bash
npx playwright test tests/filename.spec.js
```

## Viewing Test Reports

After test execution, HTML report will be generated in the `playwright-report` directory. To view the report:
```bash
npx playwright show-report
```

## Dependencies

- @playwright/test: ^1.52.0
- playwright: ^1.52.0
- axios: ^1.9.0

## Notes

- Make sure to configure any required environment variables or authentication tokens before running the tests
- The framework uses TypeScript for better type safety and developer experience
- Test reports are automatically generated after each test run
