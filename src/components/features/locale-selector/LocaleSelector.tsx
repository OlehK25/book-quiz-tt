"use client";

import { useParams, usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { locales, type Locale } from "@/i18n";

const LOCALE_STORAGE_KEY = "preferred-locale";

export default function LocaleSelector() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const t = useTranslations("locales");
  const [isOpen, setIsOpen] = useState(false);

  const currentLocale = params.locale as Locale;

  // Save locale to localStorage on change
  useEffect(() => {
    if (currentLocale) {
      localStorage.setItem(LOCALE_STORAGE_KEY, currentLocale);
    }
  }, [currentLocale]);

  const handleLocaleChange = (newLocale: Locale) => {
    // Replace current locale in path with new one
    const newPath = pathname.replace(`/${currentLocale}`, `/${newLocale}`);
    router.push(newPath);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-12 min-w-[120px] items-center justify-between gap-2 rounded-2xl bg-card px-4 text-text-primary transition-all hover:bg-card-hover"
        aria-label="Select language"
      >
        <span className="text-sm font-medium">{t(currentLocale)}</span>
        <svg
          className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 z-20 mt-2 min-w-[120px] overflow-hidden rounded-2xl bg-card shadow-lg">
            {locales.map((locale) => (
              <button
                key={locale}
                onClick={() => handleLocaleChange(locale)}
                className={`block w-full px-4 py-3 text-left text-sm transition-colors hover:bg-card-hover ${
                  locale === currentLocale
                    ? "bg-card-hover font-semibold text-primary"
                    : "text-text-primary"
                }`}
              >
                {t(locale)}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
