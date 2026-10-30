// Question 9(b): find, limit, sort, createIndex and aggregate.
const labDb = db.getSiblingDB("fsd_lab_practice");

labDb.students.insertMany([
  { name: "Ravi", age: 20, marks: 85, department: "CSE", email: "ravi@example.test" },
  { name: "Sita", age: 19, marks: 92, department: "ECE", email: "sita@example.test" },
  { name: "Rahul", age: 21, marks: 78, department: "CSE", email: "rahul@example.test" }
]);

// FIND
labDb.students.find();
labDb.students.find({ marks: { $gt: 80 } });

// LIMIT
labDb.students.find().limit(2);

// SORT: 1 = ascending, -1 = descending.
labDb.students.find().sort({ marks: 1 });
labDb.students.find().sort({ marks: -1 });

// INDEX
labDb.students.createIndex({ name: 1 });
labDb.students.createIndex({ email: 1 }, { unique: true });

// AGGREGATE: count and average marks by department.
labDb.students.aggregate([
  {
    $group: {
      _id: "$department",
      totalStudents: { $sum: 1 },
      averageMarks: { $avg: "$marks" }
    }
  },
  { $sort: { averageMarks: -1 } }
]);
