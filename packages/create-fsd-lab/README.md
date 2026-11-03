# create-fsd-lab

Lightweight cross-platform CLI scaffolder for the 18 FSD LabHub experiments.

## Install globally

~~~bash
npm install --global create-fsd-lab
~~~

Then run it from any directory:

~~~bash
create-fsd-lab
~~~

One-time use without global installation:

~~~bash
npx create-fsd-lab
~~~

## Faster dependency installation

The CLI has no runtime npm dependencies. It copies only the selected experiment templates.

When multiple ExpressJS/ReactJS experiments are selected, the generated folder contains one private npm workspace. The installer runs npm install once at the workspace root, allowing npm to share and deduplicate packages across the selected labs.

The install command uses --no-audit --no-fund --prefer-offline to reduce extra registry requests and reuse cached packages where possible.

Each generated experiment still has its own package.json and start/dev script. Run commands from that experiment's folder.

For slow or restricted internet, skip automatic dependency installation:

~~~bash
create-fsd-lab --all --dir fsd-labs --no-install
cd fsd-labs
npm install --no-audit --no-fund --prefer-offline
~~~

## Options

~~~bash
create-fsd-lab --all --dir fsd-labs
create-fsd-lab --category ExpressJS --dir express-labs
create-fsd-lab --experiment 01a --dir routing-lab
create-fsd-lab --help
~~~

Prefix with npx if the CLI is not installed globally.

## Run generated projects

- ExpressJS: enter the experiment folder and run npm start.
- ReactJS: enter the experiment folder and run npm run dev.
- MongoDB: use mongosh --file ./queries.mongodb.js from the experiment folder.

## Requirements

- Node.js 20.19 or newer and npm.
- MongoDB Server or Atlas plus mongosh for MongoDB exercises.
- Internet access for dependencies not already in the npm cache.

The installer is designed for Windows, Linux and macOS. The package itself does not install a MongoDB server or mongosh.

These templates are educational exercises, not production-ready application starters.
