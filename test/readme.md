# Test

There are 2 parts of tests, unit tests and integration tests.

The integration tests depend on MongoDB. Before the tests are run, make sure your MongoDB is up, and the address matches the one under the [setup-test.ts](/test/app.spec.ts)

```typescript
process.env.DB_STRING = 'mongodb://localhost:27017/test';
process.env.NODE_ENV = 'test';
...
```

From the above DB_STRING, you may tell that a test db is used for tests. The [db-migration](/mongo/init.json) bootstraps the same sample users to the test db. 

