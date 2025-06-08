import type { Metadata } from "next";
import { Lexend } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const lexend = Lexend({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Github User Search By Furkan Özay",
  description:
    "Search for GitHub users and view their profiles, repositories, and more.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className="dark" suppressHydrationWarning>
      <body className={lexend.className}>
        <Providers>
          <main className="container mx-auto max-w-2xl">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
