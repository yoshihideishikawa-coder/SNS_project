"use client";

import { usePathname } from "next/navigation";
import { Header } from "@/components/header";

export function RootShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <div className="app-shell">
      <Header />
      <div className="pb-16">{children}</div>
    </div>
  );
}
