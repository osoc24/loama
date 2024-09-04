import type { PublicSubject, ResourcePermissions, WebIdSubject } from 'loama-controller'

// NOTE: We hardcode the subjects here because we know what subjects the activeController uses
export type Entry = ResourcePermissions<WebIdSubject | PublicSubject> & { name: string; isContainer: boolean }

export type Result = { ok: true; value: string } | { ok: false; error: unknown }
