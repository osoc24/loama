import type { ResourcePermissions } from 'loama-controller/dist/types'

export type Entry = ResourcePermissions & { name: string; isContainer: boolean }

export type Result = { ok: true; value: string } | { ok: false; error: unknown }
