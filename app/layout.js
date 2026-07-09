import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SocketTest from "./socket-test/page";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "DocLocker | Private vault",
  description: "Secure and Easy Access",
  icons: {
    icon: "/favicon.ico", // Path to your favicon
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
         <SocketTest />
        {children}
      </body>
    </html>
  );
}
