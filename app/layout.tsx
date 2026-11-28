import type { Metadata } from "next";
import { Footer, Header } from "../components/Chrome";
import { CATEGORY, SITE_NAME, SITE_URL } from "../lib/site";
import "./globals.css";

const description = `sourced comparison of ${CATEGORY}. every claim has a source and a checked-on date. no rankings and no paid placement.`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_NAME, template: `%s — ${SITE_NAME}` },
  description,
  robots: { index: true, follow: true },
  openGraph: {
    title: SITE_NAME,
    description,
    siteName: SITE_NAME,
    type: "website",
    locale: "en_US",
  },
  twitter: { card: "summary", title: SITE_NAME, description },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <a className="skip" href="#content">
          skip to content
        </a>
        <Header />
        <main id="content">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
