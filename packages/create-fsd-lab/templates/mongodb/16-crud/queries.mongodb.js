// Question 8(b): MongoDB CRUD commands. Run with mongosh.
const labDb = db.getSiblingDB("fsd_lab_crud_practice");

// INSERT
labDb.students.insertOne({ roll: 101, name: "Ravi", age: 20, marks: 85 });

// FIND
labDb.students.find();
labDb.students.find({ roll: 101 });

// UPDATE
labDb.students.updateOne({ roll: 101 }, { $set: { marks: 95 } });

// DELETE
labDb.students.deleteOne({ roll: 101 });

// Older syllabus aliases (availability depends on shell/server version):
// labDb.students.insert({ roll: 102, name: "Sita" });
// labDb.students.update({ roll: 102 }, { $set: { marks: 90 } });
// labDb.students.remove({ roll: 102 });
