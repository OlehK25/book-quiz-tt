import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";

import { routing, type Locale } from "@/src/i18n/routing";
import "../globals.css";

export const metadata: Metadata = {
  title: "HOLYWATER Quiz - Find Your Next Favorite Book",
  description:
    "Take our personalized quiz to discover book recommendations tailored just for you. Identify your reading style today!",
  openGraph: {
    title: "HOLYWATER Quiz - Personalized Book Recommendations",
    description:
      "Discover your perfect book match based on your personality and preferences.",
    type: "website",
    siteName: "HOLYWATER Quiz",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "HOLYWATER Quiz Preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "HOLYWATER Quiz",
    description: "Find your next favorite book with our personalized quiz.",
  },
  alternates: {
    languages: {
      en: "/en/quiz/1",
      fr: "/fr/quiz/1",
      de: "/de/quiz/1",
      es: "/es/quiz/1",
    },
  },
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Validate that incoming locale is valid
  if (!routing.locales.includes(locale as Locale)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
