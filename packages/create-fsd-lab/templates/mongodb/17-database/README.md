# MongoDB database and collection commands

This experiment demonstrates selecting/creating a database, creating a collection, listing databases/collections, and the syntax for dropping a collection or database.

## Run
Connect to a local MongoDB server or Atlas, then execute:

```bash
mongosh --file queries.mongodb.js
```

The cleanup examples are commented out. To practise them after inspecting the result, uncomment the relevant line and rerun it only against the dedicated `fsd_lab_database_practice` database. Dropping a collection or database permanently removes its data.
