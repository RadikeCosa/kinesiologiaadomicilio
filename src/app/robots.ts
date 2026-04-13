import type { MetadataRoute } from "next";
import { BUSINESS_CONFIG } from "@/lib/config";

export default function robots(): MetadataRoute.Robots {
    return {
        rules: { userAgent: "*", allow: "/" },
        sitemap: `${BUSINESS_CONFIG.url}/sitemap.xml`,
    };
}
