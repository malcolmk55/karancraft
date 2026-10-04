import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "MediDoc — سامانه مطب هوشمند و پرونده الکترونیک بالینی",
  description:
    "سامانه مدیریت هوشمند مطب و بایگانی سریع پرونده، فرم‌های ساختاریافته ویزیت و تحلیل هوشمند علائم حیاتی ویژه پزشکان عمومی و داخلی.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    noarchive: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
      "max-video-preview": -1,
      "max-image-preview": "none",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fa" dir="rtl" className="h-full" suppressHydrationWarning>
      <head>
        <meta
          name="robots"
          content="noindex, nofollow, noarchive, nosnippet, noimageindex"
        />
        <meta name="googlebot" content="noindex, nofollow" />
      </head>
      <body className="min-h-full flex flex-col antialiased selection:bg-teal-500/20 selection:text-teal-900 dark:selection:text-teal-300 bg-background text-foreground transition-colors duration-150">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange={false}
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}

