# FSD LabHub

**Free, open-source starter projects for all 18 Full Stack Development laboratory experiments in the supplied syllabus.**

This repository contains source templates and an interactive command-line installer. A separate website is not required.

## Install from npm

After public npm publication:

```bash
npx create-fsd-lab
```

The installer lets students choose ExpressJS, ReactJS, MongoDB, or all 18 experiments. It copies the selected experiment into a local folder and can install its npm dependencies.

> The package has not been published yet. Until then, clone this repository and run the CLI locally.

## Syllabus coverage

### ExpressJS (8 experiments)
1. Routes, route parameters, query parameters and URL building
2. Accept, retrieve and delete resources using HTTP methods
3. Templating engine using EJS
4. Form data handling
5. Cookie and session management
6. Session-based user authentication
7. MongoDB connection with Mongoose and CRUD operations
8. Single-page application using RESTful APIs

### ReactJS (7 experiments)
9. Render a React component to a web page
10. Write markup using JSX
11. Props and state
12. CSS and Sass styling with displayed data
13. Respond to events
14. Conditional rendering
15. Rendering lists

### MongoDB Shell (3 experiments)
16. Document CRUD operations
17. Create and drop databases and collections
18. find, limit, sort, createIndex and aggregate

## Requirements

- Node.js 20.19 or newer and npm.
- MongoDB Community Server or MongoDB Atlas for database-backed Express/MongoDB exercises.
- `mongosh` or MongoDB Compass for MongoDB shell exercises.

## Run the CLI from this repository

```bash
git clone https://github.com/shiva31rama-cell/fsd-labhub.git
cd fsd-labhub
npm install
node packages/create-fsd-lab/bin/create-fsd-lab.js
```

## Tests

Basic structure and scaffolding tests:

```bash
npm test
```

Runtime smoke checks (install each Express/React project, run HTTP checks for Express, and build each React app):

```bash
node scripts/runtime-smoke.mjs
```

GitHub Actions runs both basic checks and runtime validation. The Mongoose CRUD API is exercised against a MongoDB service in CI. The three MongoDB shell query files are also executed by mongosh against that temporary service, including cleanup of the dedicated test databases. The interactive user experience is tested by running the CLI menu to scaffold all 18 experiments.

## Run an installed experiment

- ExpressJS: `cd <experiment-folder>` then `npm start`.
- ReactJS: `cd <experiment-folder>` then `npm run dev`.
- MongoDB: open `queries.mongodb.js` in mongosh or MongoDB Compass and run the commands.

## Important notes

- MongoDB shell exercises are query files, not Node.js applications. npm cannot install or start a MongoDB server.
- Some syllabus method names (`insert()`, `update()`, `remove()`) are legacy. The examples include modern mongosh equivalents.
- Authentication and in-memory session examples are educational demonstrations, not production-ready systems.
- MongoDB cleanup examples use dedicated practice database names. Read warnings before running destructive cleanup commands.
- Never commit passwords, MongoDB connection strings, API keys or other secrets.

## Project status

Runtime validation is being carried out before public npm publication. Publishing will happen only after the installer and package contents have passed final checks.

## License

MIT. See [LICENSE](LICENSE).
