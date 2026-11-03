# FSD LabHub

**Free, open-source starter projects for all 18 Full Stack Development laboratory experiments in the supplied syllabus.**

FSD LabHub provides an npm CLI that generates editable source-code projects for ExpressJS, ReactJS and MongoDB practicals.

## Install the CLI globally

~~~bash
npm install --global create-fsd-lab
~~~

After installation, run it from any directory:

~~~bash
create-fsd-lab
~~~

You can also run it once without a global install:

~~~bash
npx create-fsd-lab
~~~

> The npm registry currently has the first release, 0.1.0. The 0.2.0 performance and global-CLI improvements in this repository must be published by the maintainer before npm users receive them. After that release, use npm install --global create-fsd-lab@latest to upgrade.

## Fast dependency installation

- The CLI itself has no runtime npm dependencies and contains only the installer, catalogue and templates.
- Only dependencies for the selected ExpressJS/ReactJS experiments are installed.
- When several Node.js experiments are selected, FSD LabHub creates one private npm workspace and runs one shared npm install for the selected projects. npm can deduplicate common packages such as React, React DOM, Vite and Express.
- Installation uses --no-audit --no-fund --prefer-offline to avoid audit/funding requests and prefer packages already in the local npm cache.
- Each generated ExpressJS/ReactJS experiment keeps its own package.json. You can still run it from its own folder.
- MongoDB shell exercises are query files; they do not install a database server or MongoDB Shell automatically.

For slow or limited internet, choose not to install dependencies during scaffolding (or use --no-install). Then install once from the generated labs folder:

~~~bash
cd fsd-labs
npm install --no-audit --no-fund --prefer-offline
~~~

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
- Windows, Linux and macOS with a supported Node.js/npm installation. The CLI is designed to use the platform's npm executable; CI validation is performed on the configured GitHub Actions environments.
- MongoDB Community Server or MongoDB Atlas for database-backed Express/MongoDB exercises.
- mongosh or MongoDB Compass for MongoDB shell exercises.

## Installer options

~~~bash
# Interactive menu
create-fsd-lab

# All 18 experiments
create-fsd-lab --all --dir fsd-labs

# One category
create-fsd-lab --category ExpressJS --dir express-labs
create-fsd-lab --category ReactJS --dir react-labs
create-fsd-lab --category MongoDB --dir mongodb-labs

# One experiment
create-fsd-lab --experiment 01a --dir routing-lab

# Generate projects without downloading npm dependencies
create-fsd-lab --all --dir fsd-labs --no-install
~~~

Use create-fsd-lab --help for command help. If using npx instead of the global command, prefix these commands with npx.

## Run a generated experiment

For ExpressJS:

~~~bash
cd fsd-labs/express-routing
npm start
~~~

For ReactJS:

~~~bash
cd fsd-labs/react-rendering
npm run dev
~~~

For MongoDB Shell:

~~~bash
cd fsd-labs/mongodb-queries
mongosh --file ./queries.mongodb.js
~~~

The MongoDB command requires mongosh and a running local MongoDB server or an Atlas connection. Use your own Atlas connection string when connecting remotely.

## Run the CLI from this repository

~~~bash
git clone https://github.com/shiva31rama-cell/fsd-labhub.git
cd fsd-labhub
npm install
node packages/create-fsd-lab/bin/create-fsd-lab.js
~~~

## Tests

~~~bash
npm test
node scripts/runtime-smoke.mjs
~~~

GitHub Actions validates Express HTTP behavior, builds the seven React projects, checks creation of all 18 projects through the CLI bulk-install mode, and validates the MongoDB query files.

## Important notes

- MongoDB shell exercises are query files, not Node.js applications. npm cannot install or start a MongoDB server.
- Some syllabus method names (insert(), update(), remove()) are legacy. The examples include current mongosh equivalents.
- Authentication and in-memory session examples are educational demonstrations, not production-ready systems.
- MongoDB cleanup examples use dedicated practice database names. Read warnings before running destructive cleanup commands.
- Never commit passwords, MongoDB connection strings, API keys or other secrets.
- Dependency installation requires network access for packages not already in the local npm cache. The CLI itself is small; installing React/Express dependencies takes longer than downloading the CLI.

## Public npm release

The first public release is create-fsd-lab@0.1.0. The repository's 0.2.0 changes are prepared but require a maintainer to publish the new version from an authenticated npm account:

~~~bash
cd packages/create-fsd-lab
npm login
npm whoami
npm test
npm pack --dry-run
npm publish --access public
~~~

After successful publication, verify with:

~~~bash
npm view create-fsd-lab version
~~~

Then students can upgrade their global installation:

~~~bash
npm install --global create-fsd-lab@latest
~~~

## License

MIT. See LICENSE.
