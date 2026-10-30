// Question 9(a): create and drop database / collection
// Use this isolated practice database only.
use fsd_lab_database_practice
db.createCollection("students")
show dbs
show collections
db.students.insertOne({ roll: 101, name: "Ravi" })
// Destructive cleanup commands for this dedicated practice database only:
// db.students.drop()
// db.dropDatabase()
