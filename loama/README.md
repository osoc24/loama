# LOAMA

This is the actual Access Management App, written in Vue.

## IDP Provider

Authentication works by providing the URL to the pod provider. To ease the experience a default URL is used, this is specified in the `.env` and used in `components/LoginForm.vue`. An example can be found in `.env.example`.

## How to run

Make sure to **first build the controller!**

```sh
# Install dependencies
pnpm install

# Compile and Hot-Reload for Development
pnpm dev

# Build for production
pnpm build

```
