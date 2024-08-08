# LOAMA Controller

## Purpose

The intent of this library is to provide a wrapper around the `@inrupt/solid-client` library, such that more of the intricate Solid details are abstracted away. Furthermore, because this library lives outside of LOAMA it's easy to swap this controller out with another one that doesn't make use of `@inrupt/solid-client` under the hood.

## How to run

Currently, the build (`dist/`) files of the controller are symlinked with LOAMA. Thus, `npm run build` (or `npm run watch`) should be run before running LOAMA.

## API - now

- [x] getPod
- [x] editPermissions
- [x] getOrCreateIndex
- [x] addPermissions
- getItemId (from Index) ?
- [x] getProfileInfo
- [x] listPods
- [x] types
  - [x] FormattedThing
  - [x] Permission (enum)
  - [x] Type (enum)

## API - then

### Controller
- getOrCreateIndex(session, podUrl)
  - resources[]: FormattedThing
    - permissions[]
      - type: Type
      - permission: Permission
      - CRUD()

### SolidAppLib

- user
  - profile

### SolidCommonLib

- listPodUrls(session): urls[]
