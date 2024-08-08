import { getDefaultSession } from "@inrupt/solid-client-authn-browser";
import { reactive } from "vue";

export const store = reactive({
  session: getDefaultSession(),
  usedPod: "",
  setUsedPod(url: string) {
    this.usedPod = url;
  },
});
