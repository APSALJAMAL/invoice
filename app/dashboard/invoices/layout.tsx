import { ReactNode } from "react";
import { auth } from "@/auth";

import { Toaster } from "@/components/ui/sonner";
import { redirect } from "next/navigation";
import { getUser } from "@/app/utils/getUser";

export default async function OwnerOrAdminDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth();

  if (!session?.user?.id || !session?.user?.role) {
    console.error("Session or user ID/role not found");
    return redirect("/signin");
  }

  const allowedRoles = ["OWNER", "ADMIN"];

  if (!allowedRoles.includes(session.user.role)) {
    console.warn("Unauthorized role:", session.user.role);
    return redirect("/unauthorized"); // Make sure this page exists
  }

  await getUser(session.user.id); // Optional: Ensure onboarding is complete

  return (
    <>
      <div>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          {children}
        </main>
      </div>
      <Toaster richColors closeButton theme="light" />
    </>
  );
}
