import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mini Secure User Management",
  description: "Frontend setup for the assignment project."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

