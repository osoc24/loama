import { ref } from "vue";
import type { Entry } from "./types";

export const selectedEntry = ref<Entry | null>(null)
