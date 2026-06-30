import { notFound } from "next/navigation";
import { getRequestConfig } from "next-intl/server";

// Can be imported from a shared config
export const locales = ["en", "kh"];

export default getRequestConfig(async (params) => {
  // Support both older next-intl ({ locale }) and newer next-intl ({ requestLocale: Promise })
  const p = params as Record<string, unknown>;
  let resolvedLocale = p.locale as string | undefined;
  if (p.requestLocale) {
    resolvedLocale = await (p.requestLocale as Promise<string>);
  }
  
  const currentLocale = resolvedLocale || "en";
  
  if (!locales.includes(currentLocale)) notFound();

  return {
    locale: currentLocale,
    messages: (await import(`../messages/${currentLocale}.json`)).default,
  };
});
