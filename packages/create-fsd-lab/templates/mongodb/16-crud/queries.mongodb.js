// Question 8(b): MongoDB CRUD commands. Run in mongosh.
use fsd_lab_crud_practice
db.students.insertOne({ roll: 101, name: "Ravi", age: 20, marks: 85 })
db.students.find()
db.students.find({ roll: 101 })
db.students.updateOne({ roll: 101 }, { $set: { marks: 95 } })
db.students.deleteOne({ roll: 101 })

// Syllabus legacy method names (may not be available in modern mongosh):
// db.students.insert({ roll: 102, name: "Sita" })
// db.students.update({ roll: 102 }, { $set: { marks: 90 } })
// db.students.remove({ roll: 102 })
