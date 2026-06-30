import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';
import { locales } from './i18n';

export const routing = defineRouting({
  locales: locales,
  defaultLocale: 'en'
});

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
