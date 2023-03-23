# Contributing

There are may ways you can contribute to this project, here are some of them:


## Supplying Problem for Archive
If you have some exam problem lying around in your device (ITB first year only), you can help this project by sharing it, by creating new issue [here](https://github.com/problem-base/problem-base.github.io/issues). Use template named `Archival`, and fill the template with some information needed there.

## Writing Problem to Markdown
In order to contribute by writing the problem, you need to fulfill some of these requirements: 
1. Installed and understand some basic [git](https://git-scm.com/) command
1. [Node.js](https://nodejs.org/en) and [npm](https://www.npmjs.com/) installed on your machine
1. [Github](https://github.com/) account

If you're ready, then follow this step (Don't forget to change `UPPERCASE` word)

### Setup
1. Fork [this repo](https://github.com/problem-base/problem-base.github.io) to your github account
1. Clone your repo with `git clone YOUR_CLONED_REPO_URL`  
1. Change terminal directory to forked folder
1. Create new and switch to new branch with `git checkout -b NEW_BRANCH`
1. Find lastest commit with `git log` and copy lastest commit id
1. Cherry-pick branch, so only newest commit will be merged to main with `git cherry-pick LASTEST_COMMIT`
1. Install npm dependencies with `npm i`
1. Create config file with `npm run config-build`
1. Start development server with `npm run dev`

### Writing
10. Start writing problem by creating markdown file in `archive` folder and appropriate location. Check repo issues to find problem to write, or use your own file
1. When finished, track file with `git add .`
1. Commit change with `git commit -m "YOUR MESSAGE"`
1. You can create multiple commit with the same method, for example for different file

### Pull Request
14. Push change with `git push origin NEW_BRANCH`
1. Open cloned repo in github website
1. Open new pull request
1. Compare your branch from forked repo to main repo  
For example:
```
base repository: problem-base/problem-base.github.io  
base: main  
head repository: YOUR_USERNAME/problem-base.github.io  
base: NEW_BRANCH  
```
18. Create pull request, and add some mention to issues if available
1. Wait till maintainer merge your writing and remember to check input from maintainter too

## Creating Solution for The Problem 
It's the basically same as [writing problem](#writing-problem-to-markdown), but the only difference is you need to create appropriate solution file in `archive_solution` folder, and match it filename, directory, and problem number with problem file in `archive`
