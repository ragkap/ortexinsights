import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ortex Insights",
  description: "Browse and filter market intelligence insights from Ortex",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50">
        {children}
      </body>
    </html>
  );
}
