import createMiddleware from "next-intl/middleware";
import { routing } from "@/modules/i18n/routing";

// Create and export the i18n middleware
export const i18nMiddleware = createMiddleware(routing);
