# About this repo

This repo contain a script for regenerating the GitHub Token for the Web Experience Toolkit Bot used by Travis CI to deploy build artifacts.

# Installation

To run this script, you must be member of the release management team or an owner of the WET organization.

1. Run `npm install`
2. Create an environment variable called `WET_BOT_PASS` containing the password for the Web Experience Toolkit (Optional. If not specified the script will prompt for the password)
3. Create an environment variable called `GH_TOKEN` containing a GitHub personal access token for your User-Agent

# Running

To run the script call `node index.js`
