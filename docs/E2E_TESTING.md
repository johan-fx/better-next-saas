# E2E Testing

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and pnpm
- Docker (for MailDev service)
- Your application running locally

### Setup

1. **Install dependencies:**

   ```bash
   pnpm install
   npx playwright install
   ```

2. **Start MailDev service:**

   ```bash
   # Option 1: Using Docker Compose (recommended for CI/CD)
   docker-compose -f docker-compose.test.yml up -d maildev

   # Option 2: Using Docker directly
   docker run -d -p 1080:1080 -p 1025:1025 --name maildev maildev/maildev

   # Option 3: Using npm (for local development)
   npm install -g maildev
   maildev
   ```

3. **Configure environment variables:**

   ```bash
   # .env.local
   # Database
   DATABASE_URL="your_test_database_url"
   BETTER_AUTH_SECRET="your_test_secret"

   # Optional MailDev configuration (defaults work for most cases)
   MAILDEV_WEB_URL="http://localhost:1080"
   MAILDEV_SMTP_HOST="localhost"
   MAILDEV_SMTP_PORT="1025"

   # App configuration for email testing
   SMTP_HOST="localhost"
   SMTP_PORT="1025"
   SMTP_FROM="noreply@deckpilot.test"
   ```

4. **Run your application with test email configuration:**

   ```bash
   # Make sure your app uses the test SMTP configuration
   pnpm dev
   ```

5. **Run tests:**

   ```bash
   # Run all E2E tests
   pnpm test:e2e

   # Run tests in UI mode (for debugging)
   pnpm test:e2e:ui

   # Run specific test file
   npx playwright test tests/e2e/auth/signup.spec.ts
   ```

## 📧 MailDev Email Testing

### Why MailDev?

- **Free and local** - No external dependencies or costs
- **Fast** - No network latency for email operations
- **Reliable** - Consistent behavior across environments
- **Debugging** - Web interface to inspect emails
- **CI/CD friendly** - Easy Docker integration

### How it works

1. **Email Generation**: Tests generate unique email addresses like `test-123456@localhost`
2. **SMTP Capture**: Your app sends emails to MailDev SMTP server (localhost:1025)
3. **API Polling**: Tests query MailDev REST API to wait for emails
4. **Link Extraction**: Verification links are extracted from email HTML/text
5. **Test Continuation**: Tests click verification links to complete workflows

### Web Interface

Access MailDev web interface at `http://localhost:1080` to:

- View all captured emails
- Inspect email content (HTML/text)
- Debug email delivery issues
- Clear email history

## 🏗️ Test Structure

```bash
tests/
├── e2e/
│   ├── auth/
│   │   └── signup.spec.ts          # User signup workflow tests
│   └── utils/
│       ├── maildev.ts              # MailDev email testing utilities
│       └── test-helpers.ts         # Common test helpers and assertions
├── playwright.config.ts            # Playwright configuration
├── docker-compose.test.yml         # Docker services for testing
└── README.md                       # This file
```

## 🧪 Test Scenarios

### User Signup with Email Verification

**Main Flow Test:**

1. Navigate to signup page
2. Fill out registration form with generated email
3. Submit form and verify redirect to email verification page
4. Wait for verification email to arrive in MailDev
5. Extract verification link from email
6. Click verification link
7. Verify user is signed in and redirected to dashboard

**Validation Tests:**

- Invalid email format validation
- Password mismatch validation
- Required field validation
- Existing email handling

**Edge Cases:**

- Expired verification links
- Resending verification emails
- Network timeout scenarios

## 🔧 Configuration

### Playwright Config (`playwright.config.ts`)

Key settings:

- **Timeout**: 2 minutes for email delivery workflows
- **Retry**: 2 retries on CI, 0 locally
- **Browsers**: Chrome, Firefox, Safari, Mobile Chrome, Mobile Safari
- **Screenshots**: On failure only
- **Video**: Retained on failure
- **Parallel**: Full parallel execution

### MailDev Configuration

The `maildev.ts` utility provides:

- Unique email address generation for each test
- Email waiting with configurable timeouts
- Verification link extraction
- REST API integration for email retrieval
- Automatic cleanup (MailDev clears emails on restart)

## 🐛 Debugging

### Common Issues

**MailDev Service Not Running:**

```bash
Error: MailDev API error: 500 Internal Server Error
```

- **Solution**: Start MailDev service using Docker or npm
- Check if port 1080 is accessible: `curl http://localhost:1080/email`

**Email Timeout:**

```bash
Error: Timeout waiting for email with subject containing "verify"
```

- **Solution**: Check if your app is actually sending emails
- Verify SMTP configuration points to `localhost:1025`
- Check MailDev web interface for captured emails
- Increase timeout in test if needed

**SMTP Connection Refused:**

```bash
Error: connect ECONNREFUSED 127.0.0.1:1025
```

- **Solution**: Ensure MailDev SMTP server is running
- Check firewall/port forwarding if using Docker

**Form Field Not Found:**

```bash
Error: Element not found: input[name="email"]
```

- **Solution**: Check if form field names match your signup form
- Update selectors in `AUTH_SELECTORS` if needed

### Debug Mode

Run tests with UI mode to step through them visually:

```bash
pnpm test:e2e:ui
```

### Debugging Tips

1. **Check Email Content**: The tests log email subjects and bodies
2. **MailDev Web Interface**: Check `http://localhost:1080` for captured emails
3. **Screenshot on Failure**: Failed tests automatically capture screenshots
4. **Video Recording**: Failed tests include video recordings
5. **Console Logs**: Use `console.log()` in tests for debugging
6. **Clear Emails**: Use `clearAllEmails()` utility to reset state

## 📈 CI/CD Integration

### GitHub Actions Example

```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  e2e:
    runs-on: ubuntu-latest
    services:
      maildev:
        image: maildev/maildev:latest
        ports:
          - 1025:1025
          - 1080:1080
        options: >-
          --health-cmd "curl -f http://localhost:1080 || exit 1"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: |
          npm ci
          npx playwright install --with-deps
          
      - name: Build app
        run: npm run build
        
      - name: Start app
        run: npm start &
        
      - name: Wait for services
        run: |
          # Wait for app to be ready
          npx wait-on http://localhost:3000
          # Wait for MailDev to be ready
          npx wait-on http://localhost:1080
        
      - name: Run E2E tests
        run: npm run test:e2e
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          BETTER_AUTH_SECRET: ${{ secrets.BETTER_AUTH_SECRET }}
          MAILDEV_WEB_URL: http://localhost:1080
          SMTP_HOST: localhost
          SMTP_PORT: 1025
          
      - name: Upload test results
        uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
```

### GitLab CI Example

```yaml
stages:
  - test

e2e-tests:
  stage: test
  image: mcr.microsoft.com/playwright:v1.40.0-focal
  services:
    - name: maildev/maildev:latest
      alias: maildev
  variables:
    MAILDEV_WEB_URL: http://maildev:1080
    SMTP_HOST: maildev
    SMTP_PORT: 1025
  script:
    - npm ci
    - npx playwright install
    - npm run build
    - npm start &
    - npx wait-on http://localhost:3000
    - npx wait-on http://maildev:1080
    - npm run test:e2e
  artifacts:
    when: on_failure
    paths:
      - playwright-report/
    expire_in: 1 week
```

### Docker Compose for CI

```yaml
# Use the provided docker-compose.test.yml
version: '3.8'
services:
  maildev:
    image: maildev/maildev:latest
    ports:
      - "1025:1025"
      - "1080:1080"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:1080"]
      interval: 10s
      timeout: 5s
      retries: 5
```

## 🔄 Maintenance

### Regular Tasks

1. **Update Dependencies**: Keep Playwright updated
2. **Review Timeouts**: Adjust email timeouts based on your app's performance
3. **Monitor Test Stability**: Address flaky tests promptly
4. **Clean Docker Images**: Regularly update MailDev image

### Extending Tests

To add new test scenarios:

1. Create new test files in `tests/e2e/`
2. Use existing utilities from `utils/` directory
3. Follow the established patterns for Better Auth testing
4. Add appropriate cleanup in `afterEach` hooks
5. Update this README with new patterns

## 📚 Resources

- [Playwright Documentation](https://playwright.dev/)
- [MailDev Documentation](https://github.com/maildev/maildev)
- [Better Auth Documentation](https://better-auth.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)

## 🤝 Contributing

When adding new tests:

1. **Follow Naming Conventions**: Use descriptive test names
2. **Add Proper Documentation**: Comment complex test logic
3. **Clean Up Resources**: Always clean up test data
4. **Test Locally**: Verify tests pass locally before submitting
5. **Update Documentation**: Update this README if adding new patterns

## 📞 Support

If you encounter issues:

1. Check the debugging section above
2. Review your environment variables
3. Verify MailDev service is running
4. Check Better Auth configuration
5. Check application logs for email sending issues
6. Verify SMTP configuration points to MailDev
