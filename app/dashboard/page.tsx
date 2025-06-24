import { Suspense } from "react";
import { DashboardBlocks } from "../components/DashboardBlocks";
import { EmptyState } from "../components/EmptyState";
import { InvoiceGraph } from "../components/InvoiceGraph";
import { RecentInvoices } from "../components/RecentInvoices";
import { redirect } from "next/navigation";
import prisma from "../utils/db";
import { requireUser } from "../utils/hooks";
import { Skeleton } from "@/components/ui/skeleton";

async function getData(userId: string) {
  return prisma.invoice.findMany({
    where: {
      userId: userId,
    },
    select: {
      id: true,
    },
  });
}

export default async function DashboardRoute() {
  const session = await requireUser();

  const role = session.user?.role;
  const userId = session.user?.id;

  // 🧑‍💻 Redirect USER role to subscription
  if (role === "USER") {
    return redirect("/dashboard/subscription");
  }

  // 🧑‍💼 If ADMIN, show empty state (regardless of invoice data)
  if (role === "ADMIN") {
    return (
      <EmptyState
        title="Admin view"
        description="Admins do not manage invoices directly."
        buttontext="Go to Admin Panel"
        href="/dashboard/admin"
      />
    );
  }

  // 🧙‍♂️ OWNER or others – continue as usual
  const data = await getData(userId as string);

  return (
    <>
      {data.length < 1 ? (
        <EmptyState
          title="No invoices found"
          description="Create an invoice to see it right here"
          buttontext="Create Invoice"
          href="/dashboard/invoices/create"
        />
      ) : (
        <Suspense fallback={<Skeleton className="w-full h-full flex-1" />}>
          <DashboardBlocks />
          <div className="grid gap-4 lg:grid-cols-3 md:gap-8">
            <InvoiceGraph />
            <RecentInvoices />
          </div>
        </Suspense>
      )}
    </>
  );
}
