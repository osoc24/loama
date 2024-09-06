# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## Unreleased

## Changed

- removed pnpm dependency
- works for Node 20 LTS
- general API cleanup
- separated into more targeted modules
- Reworded some labels to make loama fit better in the solid ecosystem vocabulary
- Introduced select component which can create new permission subjects
- clone index item permission array to remove references
- Replace seperate npm lock files with yarn workspaces
- Add [nx](nx.dev) as monorepo tool to run multipe jobs at once
- Removed /loama prefix in url
- Rewritten the controller package to make the store & permission management logic modulair
- Added a toaster component to loama for better ux when an error occurs
- Try to refresh existing sessions (0-click refresh)
- Add confirm dialog when granting control permission
- Load index eagerly when requesting info about container resources
- Adds a switch will remove the access of a user. It preserves the given permissions in the index & will prevent remote from overwriting these when an item is disabled
- Add button to remove access from resource for subject
- Change components so everything uses typescript
- Add pinia store for external state management in loama
