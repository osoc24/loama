import type { FormattedThing } from 'loama-controller/dist/types'

export type Entry = FormattedThing & { name: string; isContainer: boolean }

export type Result = { ok: true; value: string } | { ok: false; error: unknown }
