# MongoDB document CRUD

Practise insert, find, update and remove operations on a students collection.

## Run
1. Start MongoDB Community Server or connect to Atlas.
2. Execute `mongosh --file queries.mongodb.js` from this folder, or paste the file into MongoDB Compass Playground.

The syllabus lists legacy `insert()`, `update()` and `remove()` methods. Modern mongosh uses `insertOne/insertMany`, `updateOne/updateMany` and `deleteOne/deleteMany`. The file uses current JavaScript-compatible mongosh commands and comments the older syllabus forms.
