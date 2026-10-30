# MongoDB query operations

Covers `find()`, `limit()`, `sort()`, `createIndex()` and `aggregate()`.

Connect to MongoDB with mongosh and run:

```bash
mongosh --file queries.mongodb.js
```

The examples use the isolated `fsd_lab_practice` database. The script inserts sample data and creates a unique index on the email field. To rerun it, first use a fresh practice database or remove the existing sample rows.
