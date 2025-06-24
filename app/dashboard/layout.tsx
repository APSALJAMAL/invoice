import { ReactNode } from "react";
import { auth } from "@/auth";
import { getUser } from "../utils/getUser";
import Link from "next/link";
import Image from "next/image";
import Logo from "@/app/favicon.ico";

import { DashboardLinks } from "../components/DashboardLinks";
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
import { signOut } from "../../auth";
import { Toaster } from "@/components/ui/sonner";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth();

  // Redirect if no session or user
  if (!session?.user?.id || !session?.user?.role) {
    console.error("Session or user ID/role not found");
    return redirect("/signin"); // Adjust based on your auth routes
  }

  const userRole = session.user.role; // Extract the role

  await getUser(session.user.id); // Ensures user is onboarded

  return (
    <>
      <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
        {/* Sidebar */}
        <div className="hidden border-r bg-muted/40 md:block">
          <div className="flex flex-col max-h-screen h-full gap-2">
            <div className="h-14 flex items-center py-14 lg:h-[60px] lg:px-6">
              <Link href="/" className="flex items-center gap-2">
                <Image src={Logo} alt="Logo" className="size-10" />
                <div className="flex flex-col justify-center leading-none">
                  <span className="text-2xl font-extrabold">REPULSO</span>
                  <span className="text-primary text-sm tracking-wider">
                    INVOICE
                  </span>
                </div>
              </Link>
            </div>
            <div className="flex-1 pt-12">
              <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
                <DashboardLinks role={userRole} />
              </nav>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-col">
          <header className="flex h-14 z-10 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
            {/* Mobile Sidebar */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="md:hidden">
                  <Menu className="size-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <nav className="grid gap-2 mt-10">
                  <DashboardLinks role={userRole} />
                </nav>
              </SheetContent>
            </Sheet>

            {/* Profile Menu */}
            <div className="flex items-center ml-auto">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    className="rounded-full"
                    variant="outline"
                    size="icon"
                  >
                    <User2 />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/profile">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <form
                      className="w-full"
                      action={async () => {
                        "use server";
                        await signOut();
                      }}
                    >
                      <button className="w-full text-left">Log out</button>
                    </form>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
            {children}
          </main>
        </div>
      </div>
      <Toaster richColors closeButton theme="light" />
    </>
  );
}
