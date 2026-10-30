// Question 9(a): create and drop databases / collections.
// This file is JavaScript-compatible so it can be run with mongosh --file.
const labDb = db.getSiblingDB("fsd_lab_database_practice");

// Create a collection.
labDb.createCollection("students");

// List databases and collections.
printjson(db.adminCommand({ listDatabases: 1 }).databases.map((item) => item.name));
printjson(labDb.getCollectionNames());

// Store a record so the database is created on disk.
labDb.students.insertOne({ roll: 101, name: "Ravi" });

// Cleanup syntax for this dedicated practice database (run only when finished):
// labDb.students.drop();   // drop the collection
// labDb.dropDatabase();    // drop the selected database
