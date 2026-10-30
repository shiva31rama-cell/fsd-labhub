# FSD LabHub

**Free, open-source starter projects for 18 Full Stack Development (FSD) laboratory experiments.**

FSD LabHub will provide:
- A public website to browse experiments, read instructions, and copy installation commands.
- A public npm CLI package that scaffolds selected experiment projects.
- Downloadable source templates and beginner-friendly run instructions.

## Syllabus coverage

### ExpressJS
1. Routes, route parameters, query parameters, and URL building
2. HTTP methods: accept, retrieve, and delete resources
3. EJS templating
4. HTML form data
5. Cookies and sessions
6. Session-based user authentication (educational demo)
7. MongoDB with Mongoose CRUD
8. Single-page task interface backed by RESTful APIs

### ReactJS
9. Rendering a component to a web page
10. JSX markup
11. Props and state
12. CSS and Sass styling with displayed data
13. Event handling
14. Conditional rendering
15. List rendering

### MongoDB Shell
16. Document CRUD operations
17. Create and drop databases and collections
18. find, limit, sort, createIndex, and aggregate

## Free installation model

All student-facing packages are intended to be **public**. Public npm packages can be published and installed on npm's free plan. Private npm packages are not required for this project.

The planned installer command is:

```bash
npx create-fsd-lab
```

The CLI will offer category and experiment selection, copy the chosen template, install its project dependencies, and print run instructions.

## Requirements

- Node.js and npm for Express/React templates and the CLI.
- MongoDB Community Server or a MongoDB Atlas connection for database-backed experiments.
- `mongosh` for MongoDB shell exercises.

## Project status

Initial repository setup. The next implementation steps are to add and test all 18 templates, implement the CLI, publish the CLI publicly on npm, and build the catalogue website.

## Safety and learning notes

These are educational lab examples, not production-ready application templates. Authentication/session examples must use demo-only credentials and clear security warnings. Never commit real passwords, database connection strings, API keys, or personal data.

## License

MIT. See [LICENSE](LICENSE).
