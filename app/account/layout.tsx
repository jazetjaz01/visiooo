import * as React from "react";
import { AccountSidebar } from "@/components/account/sidebar";
import { AccountBreadcrumb } from "@/components/account/account-breadcrumb";

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="">
      <AccountSidebar />
      <main className="flex-1 ">
        <div className="  ">
          <AccountBreadcrumb />
        </div>
        {children}
      </main>
    </div>
  );
}
