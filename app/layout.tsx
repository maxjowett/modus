import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MODUS",
  description: "7 modes of the major scale",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
