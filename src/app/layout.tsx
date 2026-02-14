import type { Metadata, Viewport } from "next";
import { Newsreader } from "next/font/google";
import "./globals.css";
import { absUrl, SITE_URL } from "@/lib/site";

const newsreader = Newsreader({
  variable: "--font-display",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#0a0a0f",
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Ben Dinledim | Indie Müzik Blogu",
    template: "%s | Ben Dinledim",
  },
  description:
    "Yabancı indie müzik dünyasından en güncel haberler, albüm incelemeleri, röportajlar ve keşfedilmeyi bekleyen sanatçılar. Pitchfork, NME, Stereogum ve daha fazlasından derlenen Türkçe müzik içerikleri.",
  keywords: [
    "indie müzik",
    "müzik blogu",
    "müzik haberleri",
    "albüm inceleme",
    "yabancı müzik",
    "pitchfork türkçe",
    "alternatif müzik",
    "yeni çıkan albümler",
    "müzik önerileri",
  ],
  authors: [{ name: "Ben Dinledim" }],
  creator: "Ben Dinledim",
  publisher: "Ben Dinledim",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: SITE_URL,
    siteName: "Ben Dinledim",
    title: "Ben Dinledim | Indie Müzik Blogu",
    description:
      "Yabancı indie müzik dünyasından en güncel haberler, albüm incelemeleri ve röportajlar.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Ben Dinledim - Indie Müzik Blogu",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ben Dinledim | Indie Müzik Blogu",
    description:
      "Yabancı indie müzik dünyasından en güncel haberler, albüm incelemeleri ve röportajlar.",
    images: ["/og-image.jpg"],
    creator: "@bendinledim",
  },
  alternates: {
    canonical: SITE_URL,
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  verification: {
    // Keep this in code for now; you can also set it via env if you prefer.
    google:
      process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ||
      "google-site-verification-code",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const siteUrlNoSlash = SITE_URL.replace(/\/+$/, "");
  return (
    <html lang="tr" className="dark">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        {/* Structured Data - Website */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "Ben Dinledim",
              url: siteUrlNoSlash,
              description:
                "Yabancı indie müzik dünyasından en güncel haberler ve albüm incelemeleri",
              inLanguage: "tr-TR",
              publisher: {
                "@type": "Organization",
                name: "Ben Dinledim",
                logo: {
                  "@type": "ImageObject",
                  url: absUrl("/logo.png"),
                },
              },
              potentialAction: {
                "@type": "SearchAction",
                target: {
                  "@type": "EntryPoint",
                  urlTemplate: `${siteUrlNoSlash}/arama?q={search_term_string}`,
                },
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
      </head>
      <body className={`${newsreader.variable} antialiased`}>{children}</body>
    </html>
  );
}
