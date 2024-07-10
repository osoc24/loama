# LOAMA Controller

## Purpose

The intent of this library is to provide a wrapper around the `@inrupt/solid-client` library, such that more of the intricate Solid details are abstracted away. Furthermore, because this library lives outside of LOAMA it's easy to swap this controller out with another one that doesn't make use of `@inrupt/solid-client` under the hood.

## How to run

Currently, the build (`dist/`) files of the controller are symlinked with LOAMA. Thus, `pnpm run dev` should be run before running LOAMA.
