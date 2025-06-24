// app/dashboard/subscription/[subscriptionId]/page.tsx

import { notFound } from "next/navigation";
import prisma from "@/app/utils/db";
import InvoiceClientView from "./InvoiceClientView";

export default async function Page({
  params,
}: {
  params: { invoiceId: string };
}) {
  const invoice = await prisma.invoice.findUnique({
    where: { id: params.invoiceId },
    include: { items: true },
  });

  if (!invoice) return notFound();

  const subtotal = invoice.items.reduce((sum, item) => sum + item.quantity * item.rate, 0);
  const gstRate = 0.18;
  const gstAmount = subtotal * gstRate;
  const totalWithGST = subtotal + gstAmount;
  const dueInDays = invoice.dueDate;

  return (
    <InvoiceClientView
      invoice={{
        ...invoice,
        subtotal,
        gstAmount,
        totalWithGST,
        dueInDays,
      }}
    />
  );
}