import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ustaad.com — Find Verified Tutors in Pakistan",
  description: "Search, compare, and hire verified tutors by subject, level, and city.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
