# LOAMA Controller

## Purpose

The intent of this library is to provide a wrapper around the `@inrupt/solid-client` library, such that more of the intricate Solid details are abstracted away. Furthermore, because this library lives outside of LOAMA it's easy to swap this controller out with another one that doesn't make use of `@inrupt/solid-client` under the hood.

## How to run

Currently, the build (`dist/`) files of the controller are symlinked with LOAMA. Thus, `npm run build` (or `npm run watch`) should be run before running LOAMA.

## API

### Controller

> top-level is the public API

- setPodUrl / unsetPodUrl
- getOrCreateIndex
- getItem
- addPermission / removePermission // TODO this should later be update index: resource / type / permissions / extensible properties (eg the webid)
- createPermissions / editPermissions

// pod
- getContainerResources(session, containerUrl)[]: ResourcePermissions // TODO this currently only takes remote into account, not the index.json
      - [ ] resourcePermissions[] // TODO, right now it's {[webid: string]: Permissions[]}
        - subject
          - type: Type
          - selector.url: WebID
        - permissions[]
      - [ ] add/edit/remove to/from resource // TODO
- types
  - ResourcePermissions
  - Permission (enum)
  - Type (enum)

- WAC/ACP manager API // TODO

### SolidAppLib

### SolidCommonLib

- listPodUrls(session): urls[]
- getProfileInfo

### Index

// TODO must be updated to be more flexible

```json
{
    "requests": [
        {
            "id": "uuid",
            "resources": [],
            "subject": { // TODO
                "type": "Group|WebID",
                "url": ""
            } | true/false,
            "permissions": [],
            "isEnabled": true
        },
        {
            "id": "uuid",
            "requestId?": "uuid", // for later (currently use random v4's)
            "resource": "",
            "subject": { // The controller implementation should be defined based on which subject is used for the entry
                "type": "group|webid|public|qualifier",
                "selector?": {
                    "url": "for group/webid",
                    "qualifierType": "personnelName" // For qualifier
                }
            },
            "permissions": [], // TODO?
            "isEnabled": true
        }
    ]
}
```
