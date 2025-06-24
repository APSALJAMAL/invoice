import { ReactNode } from "react";
import { auth } from "@/auth";

import Link from "next/link";
import Image from "next/image";
import Logo from "@/app/favicon.ico";


import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, User2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Toaster } from "@/components/ui/sonner";
import { redirect } from "next/navigation";
import { getUser } from "@/app/utils/getUser";

export default async function OwnerDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth();

  if (!session?.user?.id || !session?.user?.role) {
    console.error("Session or user ID/role not found");
    return redirect("/signin");
  }

  if (session.user.role !== "OWNER") {
    console.warn("Unauthorized role:", session.user.role);
    return redirect("/unauthorized"); // You can create this page
  }

  await getUser(session.user.id); // Optional: Ensure onboarding is complete

  return (
    <>
      <div >
        

       

          <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
            {children}
          </main>
        </div>
      <Toaster richColors closeButton theme="light" />
    </>
  );
}
