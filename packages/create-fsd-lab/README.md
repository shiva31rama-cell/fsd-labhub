# create-fsd-lab

Interactive scaffolder for the 18 FSD LabHub experiments.

## Planned public command

After the package is published publicly on npm:

```bash
npx create-fsd-lab
```

The installer lets a student choose ExpressJS, ReactJS, MongoDB or all experiments. It copies the selected template into a new folder and installs that project's npm dependencies.

## Local development

From the repository root:

```bash
npm install
node packages/create-fsd-lab/bin/create-fsd-lab.js
```

MongoDB shell exercises are query files, not Node applications. They require `mongosh` or a compatible MongoDB interface and a running MongoDB deployment.
