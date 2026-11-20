import type { MetadataRoute } from "next";
import { latestCheckedOn } from "../lib/data";
import { indexableRoutes } from "../lib/routes";
import { SITE_URL } from "../lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = latestCheckedOn();
  return indexableRoutes().map((route) => ({
    url: `${SITE_URL}${route.path}`,
    lastModified,
  }));
}
