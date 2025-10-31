"use client";

import { usePathname } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";

import Navbar from "@/components/navbar";
import { AppSidebar } from "@/components/app-sidebar";
import { AccountSidebar } from "@/components/account-sidebar";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";

export default function DynamicSidebarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const isAccountPage = pathname.startsWith("/account");
  const sidebar = isAccountPage ? <AccountSidebar /> : <AppSidebar />;

  const pageName = isAccountPage ? "Mon compte" : "Accueil";

  return (
    <SidebarProvider>
      {sidebar}

      <div className="flex flex-col w-full">
        <Navbar />

        <SidebarInset>
          <header className="flex h-16 items-center gap-2 border-b border-border bg-background/95 backdrop-blur px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbPage>{pageName}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </header>

          <main className="flex-1 overflow-y-auto p-4">{children}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
