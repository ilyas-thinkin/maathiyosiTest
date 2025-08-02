import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar"; 
import Footer from "./components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Maathiyosi",
  description: "India’s modern edutech platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        
        {/* ✅ Global Navbar */}
        <Navbar />

        {/* ✅ Push page content down so it doesn’t hide under fixed navbar */}
        <main className="pt-20 min-h-screen">
          {children}
        </main>

        {/* ✅ Global Footer */}
        <Footer />

        {/* ✅ Add any global scripts or components here */}
        
      </body>
    </html>
  );
}
