# Test Setup Instructions

## Installing Test Dependencies

To run the test suite, you need to install the test dependencies:

```bash
pnpm install -D vitest @vitest/coverage-v8
```

Or with npm:

```bash
npm install -D vitest @vitest/coverage-v8
```

## Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage
```

## Test Structure

Tests are located in the `__tests__` directory:

- `__tests__/api/search.test.ts` - Search API tests
- `__tests__/api/football-api.test.ts` - Football API tests

## Writing New Tests

1. Create test files in `__tests__/` directory
2. Use Vitest testing framework
3. Follow the existing test patterns
4. Test both success and error cases
5. Include edge cases and boundary conditions

## Example Test

```typescript
import { describe, it, expect } from 'vitest';

describe('Feature Name', () => {
  it('should do something', () => {
    expect(true).toBe(true);
  });
});
```

