// Question 9(b): find, limit, sort, createIndex and aggregate
use fsd_lab_practice
db.students.insertMany([
 { name: "Ravi", age: 20, marks: 85, department: "CSE", email: "ravi@example.test" },
 { name: "Sita", age: 19, marks: 92, department: "ECE", email: "sita@example.test" },
 { name: "Rahul", age: 21, marks: 78, department: "CSE", email: "rahul@example.test" }
])
db.students.find()
db.students.find({ marks: { $gt: 80 } })
db.students.find().limit(2)
db.students.find().sort({ marks: 1 })
db.students.find().sort({ marks: -1 })
db.students.createIndex({ name: 1 })
db.students.createIndex({ email: 1 }, { unique: true })
db.students.aggregate([
 { $group: { _id: "$department", totalStudents: { $sum: 1 }, averageMarks: { $avg: "$marks" } } },
 { $sort: { averageMarks: -1 } }
])
