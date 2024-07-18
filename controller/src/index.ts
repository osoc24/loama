import { FOAF } from "@inrupt/vocab-common-rdf";

export * from "./pod";
export * from "./index-file";

export const Schema = {
  name: FOAF.name,
  mbox: FOAF.mbox,
  description: "http://schema.org/description",
  img: FOAF.img,
  phone: FOAF.phone,

  text: "https://schema.org/text",
  video: "https://schema.org/video",
  image: "https://schema.org/image",

  additionalType: "https://schema.org/additionalType",
  location: "https://schema.org/location",
  provider: "https://schema.org/provider",
  scheduledTime: "https://schema.org/scheduledTime",
};
