import { EditInvoice } from "@/app/components/EditInvoice";
import prisma from "@/app/utils/db";
import { requireUser } from "@/app/utils/hooks";
import { notFound } from "next/navigation";

async function getData(invoiceId: string, userId: string) {
  const data = await prisma.invoice.findUnique({
    where: {
      id: invoiceId,
      userId,
    },
    include: {
      items: true,
    },
  });

  if (!data) {
    notFound();
  }

  // Convert the data to match EditInvoice's InvoiceData type
  return {
    ...data,
    invoiceNumber: String(data.invoiceNumber),
    total: String(data.total),
    note: data.note ?? "", // ✅ Convert null to empty string

    date: data.date.toISOString(),
    dueDate: String(data.dueDate), // ✅ Fix this line
    items: data.items.map((item) => ({
      description: item.description,
      quantity: String(item.quantity),
      rate: String(item.rate),
    })),
  };
}

type Params = Promise<{ invoiceId: string }>;

export default async function EditInvoiceRoute({ params }: { params: Params }) {
  const { invoiceId } = await params;
  const session = await requireUser();
  const data = await getData(invoiceId, session.user?.id as string);

  return <EditInvoice invoice={data} />;
}
