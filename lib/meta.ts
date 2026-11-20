import type { Metadata } from "next";
import { SITE_NAME, SITE_URL } from "./site";

export function pageMeta(title: string, description: string, path: string): Metadata {
  const url = `${SITE_URL}${path}`;
  const text = description.length > 220 ? `${description.slice(0, 217).trim()}...` : description;
  return {
    title: { absolute: title },
    description: text,
    alternates: { canonical: url },
    openGraph: {
      title,
      description: text,
      url,
      siteName: SITE_NAME,
      type: "website",
      locale: "en_US",
    },
    twitter: { card: "summary", title, description: text },
  };
}
