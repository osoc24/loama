# LOAMA Controller

## Purpose

The intent of this library is to provide a wrapper around the `@inrupt/solid-client` library, such that more of the intricate Solid details are abstracted away. Furthermore, because this library lives outside of LOAMA it's easy to swap this controller out with another one that doesn't make use of `@inrupt/solid-client` under the hood.

## How to run

Currently, the build (`dist/`) files of the controller are symlinked in the node_modules in the root of this git repo. Thi symlinked is created by yarn with their workspace function.
If you just want to use this library, you can run `yarn build` to transpile the typescript files to valid js files in the `dist/` folder.
To use the loama project, see the README in the repo root

## What is What?

The most important part of the library that you will interact with is the controller.
It handles all the communication with it's modules.
The following options are modulair
- Store
- The subjects the controller can work with
    - Permission
    - Subject Resolver

### Subjects

A subject is a representation of a certain something that will allow you to have permissions for a resource.
The subject always follow the same type:
```json
{
    "type": "subject-type", // e.g. webId
    "selector": { // The selector is optional but allows for certain types to have a better filter on who or what the subject has impact
        "url": "https://pod.example.com/exampleUser/profile/card#me" // An example webId to indicate that this subject only has impact on the user who's webId match with the one given in this selector
    }
}
```

## API

The controller project exists of 4 big parts:
- The (main) controller
- Stores
- PermissionManagers
- SubjectResolvers

### Controller

This is the main interaction point for other parties using this library.
It exposes the following functions. The specific types for the parameters can be found in the `types/modules.ts` file

- `setPodUrl(podUrl)`: Set's the pod where the index.json is retrieved from
- `unsetPodUrl(podUrl)`: Unsets the pod in the store. Will result in errors when trying to do actions without a pod set
- `getLabelForSubject(subject)`: Get a more user friendly label for a specific subject
- `getOrCreateIndex()`: Get the currently loaded index, it tries to load the index from pod url and if it doesn't exist it get's created
- `getItem(resourceUrl, subject)`: Returns the index item for the specific subject & resource if one exist in the currently loaded index
- `addPermission(resourceUrl, addedPermission, subject)`: Adds the permission for the given subject if it is not already granted based on the index
- `removePermission(resourceUrl, addedPermission, subject)`: Removes the permission of the given subject of they were granted based on the index
- `enablePermissions(resourceUrl, subject)`: If the permissions were disabled, it re-enables them, this will re-add the permissions to the ACL that are in the permissions array of the index item for the subject
- `disablePermissions(resourceUrl, subject)`: Disabled the permissions, the given permissions are removed from the ACL but are still stored in the index & can easily be re-enabled with the above function
- `getContainerPermissionList`: Returns a list with all the resources in the container resource accompanied with the configured permissions for each subject (These are lazy-loaded until something for #7 is implemented)
- `getResourcePermissionList`: Gets the permissions for all subjects with access to the given resource

### Stores

A store is a swappable module which will handle all the interactions with the index.json file in the pod.
It is recommended to extend the `BaseStore` file when implementing your own version

### Permission Managers

Handles all the interaction with the .acl files of the resources

### SubjectResolvers

A small class which will enable the controller to interact with this certain type of subject.

### IndexItem

An item in the index should have the following structure

```json
{
    "id": "uuid",
    "requestId?": "uuid", // for later (currently use random v4's)
    "resource": "",
    "subject": {
        "type": "group|webid|public|qualifier",
        "selector?": {
            "url": "for group/webid",
            "qualifierType": "personnelName" // For qualifier
        }
    },
    "permissions": [],
    "isEnabled": true
}
```

## Creating your own controller

The library has a preconfigured controller which uses modules created with the inrupt SDK.
If you want to use your own modules or add some new subject types to your controller you can easily create your own if you implement the module types which can be found in `/types/modules`.

An example for a custom controller goes as follow:
```typescript
type AgeQualifierSubject = {
    type: "qualifier";
    selector: {
        ageRestriction: true
        name: string;
    }
}

type PlaceQualifierSubject = {
    type: "qualifier";
    selector: {
        placeRestriction: true
        name: string;
    }
}

const myController = new Controller<{
    ageQualifier: AgeQualifierSubject,
    placeQualifier: PlaceQualifierSubject,
}>(
    new CommunicaStore(),
    {
        ageQualifier: {
            resolver: new AgeQualifierResolver(),
            manager: new QualifierResolver(),
        },
        placeQualifier: {
            resolver: new PlaceQualifierResolver(),
            manager: new QualifierResolver(),
        },
    },
);
```
