import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Product Predict — predict your product's feedback before you ship",
  description:
    "A population of synthetic users uses your product like real users would, then reports how that population felt. Local CLI, real browser, real persona-driven feedback.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
