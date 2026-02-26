import type { Metadata } from "next";
import { Inter, Noto_Sans_JP } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { ensureSupabaseUser } from "@/lib/supabase/auth-helpers";
import { RootShell } from "@/components/root-shell";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-geist-sans" });
const notoSansJP = Noto_Sans_JP({ 
  subsets: ["latin"], 
  weight: ["400", "500", "700"],
  variable: "--font-noto-sans-jp",
  preload: false
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
          <RootShell>{children}</RootShell>
        </body>
      </html>
    </ClerkProvider>
  );
}
