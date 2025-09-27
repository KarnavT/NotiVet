import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NotiVet - Veterinary Drug Information Made Simple",
  description: "Connect pharmaceutical companies with veterinary professionals through targeted notifications and comprehensive drug databases.",
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