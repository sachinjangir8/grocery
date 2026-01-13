import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "next-auth/react";
import Provider from "@/Provider";
import StoreProvider from "@/redux/StoreProvider";
import InitUser from "@/initUser";
// we can not make it clint component because it is layout file
// layout file only for server side rendering
// but we can use client component inside layout file
export const metadata: Metadata = {
  title: "grocery app",
  description: "A grocery app built with Next.js, MongoDB, and NextAuth.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="w-full min-h-screen bg-linear-to-b from-green-200 to-white " >
        <Provider>
          <StoreProvider>
            <InitUser />
            {children}
          </StoreProvider>
        </Provider>
      </body>
    </html>
  );
}
