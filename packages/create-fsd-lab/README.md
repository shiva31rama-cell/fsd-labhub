# create-fsd-lab

Interactive command-line scaffolder for the 18 FSD LabHub experiments.

## Public installation (after npm publication)

```bash
npx create-fsd-lab
```

Choose ExpressJS, ReactJS, MongoDB or all experiment templates. The installer copies the selected source template and offers to install the required npm dependencies.

## Non-interactive options

```bash
npx create-fsd-lab --all --dir fsd-labs
npx create-fsd-lab --category ExpressJS --dir express-labs
npx create-fsd-lab --experiment 01a --dir routing-lab
```

Add `--no-install` to scaffold projects without running npm install. Use `npx create-fsd-lab --help` to see these options.

## Run from the GitHub repository

```bash
npm install
node packages/create-fsd-lab/bin/create-fsd-lab.js
```

## Generated projects

- ExpressJS templates generate a Node project with `npm start`.
- ReactJS templates generate a Vite project with `npm run dev`.
- MongoDB templates contain `queries.mongodb.js` files for mongosh / MongoDB Compass. They do not require npm packages.

## Requirements

Node.js 20.19 or newer for the current Vite toolchain. MongoDB exercises additionally require a MongoDB server or Atlas connection and mongosh.

These templates are educational exercises, not production-ready application starters.
