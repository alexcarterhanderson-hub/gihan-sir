import type { Metadata } from "next";
import "./globals.css";
import "./inquiry.css";
import "./polish.css";
import "./viewer.css";
import "./gallery-fix.css";
import "./gallery-performance.css";
import "./performance.css";

export const metadata: Metadata = {
  title: "Science in Motion | විද්‍යාවට අලුත් මානයක්",
  description: "කුතුහලයෙන් ඇරඹෙන විද්‍යා ගමනක්. 6–11 ශ්‍රේණි සඳහා විද්‍යාව, ප්‍රායෝගික ක්‍රියාකාරකම් හා පාඩම්.",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="si">
      <body className="antialiased">{children}</body>
    </html>
  );
}
