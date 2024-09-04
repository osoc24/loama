# LOAMA

LOAMA is a Linked Open Access Management App, written in Vue.

## IDP Provider

Authentication works by providing the URL to the pod provider. To ease the experience a default URL is used, this is specified in the `.env` and used in `components/LoginForm.vue`. An example can be found in `.env.example`.

## How to run

Make sure you run these commands in the root of the project for a better dx. We use a monorepo tool to automatically build the other libaries in this repo

```sh
# Install dependencies
yarn

# Compile and Hot-Reload for Development
yarn dev

# Build for production
yarn build

```

### How to manually test this project
- Login with a valid IDP
- Select a file (I've mostly used the README file)
- In the right column, click the "Edit" button. This should open a drawer. 
  This drawer should contain a table with all the subjects who have access to the file
- Click the "New Subject" to give a new subject access. This will again open a new smaller drawer where you can select the subject type
- Select "WebId" and give a webId which already has been added to the ACL file/table (e.g. your own webId)
- This should give an error in the console + a toast notification that the webId has been added previously
- Now use a webId which isn't present in the ACL file/table
- Click on the "Create" button, the Drawer should close & the new webId should be visible in the table
- Now choose one of the entries in the table & hit the "Edit" button at the end of the row
- Grant a new permission by checking the checkbox in the new drawer that should've opened.
- When you close this drawer. You'll see that your changes are reflected in the table (give it a second to reload the data)
- You can do multiple grants/revokes at once in the "edit subject" drawer
  - If you do them too fast after each other the inrupt SDK will freak out and skip some changes to the ACL file which will result in a desync between the ACL & the index.json
