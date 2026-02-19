
import type { Metadata } from "next";
import { Inter, Noto_Sans_JP } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { Header } from "@/components/header";
import { ensureSupabaseUser } from "@/lib/supabase/auth-helpers";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-geist-sans" });
const notoSansJP = Noto_Sans_JP({ 
  subsets: ["latin"], 
  weight: ["400", "500", "700"],
  variable: "--font-noto-sans-jp",
  preload: false // Load on demand to save bandwidth
});

export const metadata: Metadata = {
  title: "Seichi Route",
  description: "See it, Route it, Snap it. The immersive pilgrimage guide.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { userId } = await auth();

  if (userId) {
    try {
      await ensureSupabaseUser();
    } catch (error) {
      console.error("Failed to sync user to Supabase:", error);
    }
  }

  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${inter.variable} ${notoSansJP.variable} antialiased bg-background text-foreground`}>
          <div className="app-shell">
            <Header />
            <div className="pb-16">
              {children}
            </div>
          </div>
        </body>
      </html>
    </ClerkProvider>
  );
}
