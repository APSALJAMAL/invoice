"use server";

import { requireUser } from "./utils/hooks";
import { parseWithZod } from "@conform-to/zod";
import { invoiceSchema, onboardingSchema } from "./utils/zodSchemas";
import prisma from "./utils/db";
import { redirect } from "next/navigation";
import { emailClient } from "./utils/mailtrap";
import { formatCurrency } from "./utils/formatCurrency";

export async function onboardUser(prevState: any, formData: FormData) {
  const session = await requireUser();

  // ✅ Check if session has valid user ID
  if (!session?.user?.id) {
    throw new Error("Unauthorized: Missing user ID");
  }

  const submission = parseWithZod(formData, {
    schema: onboardingSchema,
  });

  if (submission.status !== "success") {
    return submission.reply();
  }

  const data = await prisma.user.update({
    where: {
      id: session.user.id, // ✅ now guaranteed to be defined
    },
    data: {
      name: submission.value.name,
      address: submission.value.address,
    },
  });

  return redirect("/dashboard");
}

//////////////////////////
export async function createInvoice(prevState: any, formData: FormData) {
  const session = await requireUser();

  const submission = parseWithZod(formData, {
    schema: invoiceSchema,  // your Zod schema should now validate items: array of { description, quantity, rate }
  });

  if (submission.status !== "success") {
    return submission.reply();
  }

  // Prepare the items array for Prisma nested create
  const itemsData = submission.value.items.map((item: any) => ({
    description: item.description,
    quantity: item.quantity,
    rate: item.rate,
  }));

  const data = await prisma.invoice.create({
    data: {
      clientAddress: submission.value.clientAddress,
      clientEmail: submission.value.clientEmail,
      clientName: submission.value.clientName,
      currency: submission.value.currency,
      date: submission.value.date,
      dueDate: submission.value.dueDate,
      fromAddress: submission.value.fromAddress,
      fromEmail: submission.value.fromEmail,
      fromName: submission.value.fromName,
      invoiceName: submission.value.invoiceName,
      invoiceNumber: submission.value.invoiceNumber,
      status: submission.value.status,
      total: submission.value.total,
      note: submission.value.note,
      userId: session.user?.id,
      items: {
        create: itemsData, // Nested create for invoice items
      },
    },
  });

  // const sender = {
  //   email: "hello@demomailtrap.com",
  //   name: "Jan Marshal",
  // };

  // emailClient.send({
  //   from: sender,
  //   to: [{ email: "jan@alenix.de" }],
  //   template_uuid: "3c01e4ee-a9ed-4cb6-bbf7-e57c2ced6c94",
  //   template_variables: {
  //     clientName: submission.value.clientName,
  //     invoiceNumber: submission.value.invoiceNumber,
  //     invoiceDueDate: new Intl.DateTimeFormat("en-US", {
  //       dateStyle: "long",
  //     }).format(new Date(submission.value.date)),
  //     invoiceAmount: formatCurrency({
  //       amount: submission.value.total,
  //       currency: submission.value.currency as any,
  //     }),
  //     invoiceLink:
  //       process.env.NODE_ENV !== "production"
  //         ? `http://localhost:3000/api/invoice/${data.id}`
  //         : `https://invoice-marshal.vercel.app/api/invoice/${data.id}`,
  //   },
  // });

  return redirect("/dashboard/invoices");
}


export async function editInvoice(prevState: any, formData: FormData) {
  const session = await requireUser();

  const submission = parseWithZod(formData, {
    schema: invoiceSchema,  // Your schema must have 'items' array
  });

  if (submission.status !== "success") {
    return submission.reply();
  }

  const invoiceId = formData.get("id") as string;

  // Update invoice main fields (excluding items)
  const data = await prisma.invoice.update({
    where: {
      id: invoiceId,
      userId: session.user?.id,
    },
    data: {
      clientAddress: submission.value.clientAddress,
      clientEmail: submission.value.clientEmail,
      clientName: submission.value.clientName,
      currency: submission.value.currency,
      date: submission.value.date,
      dueDate: submission.value.dueDate,
      fromAddress: submission.value.fromAddress,
      fromEmail: submission.value.fromEmail,
      fromName: submission.value.fromName,
      invoiceName: submission.value.invoiceName,
      invoiceNumber: submission.value.invoiceNumber,
      status: submission.value.status,
      total: submission.value.total,
      note: submission.value.note,
    },
  });

  // Delete existing items for this invoice
  await prisma.invoiceItem.deleteMany({
    where: { invoiceId },
  });

  // Re-create items from submitted data
  const itemsData = submission.value.items.map((item: any) => ({
    description: item.description,
    quantity: item.quantity,
    rate: item.rate,
    invoiceId,
  }));

  await prisma.invoiceItem.createMany({
    data: itemsData,
  });

  // const sender = {
  //   email: "hello@demomailtrap.com",
  //   name: "Jan Marshal",
  // };

  // emailClient.send({
  //   from: sender,
  //   to: [{ email: "jan@alenix.de" }],
  //   template_uuid: "9d04aa85-6896-48a8-94e9-b54354a48880",
  //   template_variables: {
  //     clientName: submission.value.clientName,
  //     invoiceNumber: submission.value.invoiceNumber,
  //     invoiceDueDate: new Intl.DateTimeFormat("en-US", {
  //       dateStyle: "long",
  //     }).format(new Date(submission.value.date)),
  //     invoiceAmount: formatCurrency({
  //       amount: submission.value.total,
  //       currency: submission.value.currency as any,
  //     }),
  //     invoiceLink:
  //       process.env.NODE_ENV !== "production"
  //         ? `http://localhost:3000/api/invoice/${data.id}`
  //         : `https://invoice-marshal.vercel.app/api/invoice/${data.id}`,
  //   },
  // });

  return redirect("/dashboard/invoices");
}


export async function DeleteInvoice(invoiceId: string) {
  const session = await requireUser();

  const data = await prisma.invoice.delete({
    where: {
      userId: session.user?.id,
      id: invoiceId,
    },
  });

  return redirect("/dashboard/invoices");
}

export async function MarkAsPaidAction(invoiceId: string) {
  const session = await requireUser();

  const data = await prisma.invoice.update({
    where: {
      userId: session.user?.id,
      id: invoiceId,
    },
    data: {
      status: "PAID",
    },
  });

  return redirect("/dashboard/invoices");
}

///////////////////

export async function getSubscriptionById(subscriptionId: string) {
  console.log("Fetching subscription with ID:", subscriptionId);

  try {
    const sub = await prisma.invoice.findUnique({
      where: { id: subscriptionId }, // Use explicit id here
    });

    if (!sub) {
      console.error("❌ Subscription not found in DB");
      return null;
    }

    return sub;
  } catch (error) {
    console.error("❌ Error fetching subscription:", error);
    return null;
  }
}

export async function addOrderId(subscriptionId: string, orderId: string) {
  return await prisma.invoice.update({
    where: { id: subscriptionId }, // Explicit id
    data: {
      verify: orderId, // Should work if Prisma client is regenerated
    },
  });
}

export async function updateStatusDone(invoiceId: string) {
  try {
    const updatedInvoice = await prisma.invoice.update({
      where: {
        
        id: invoiceId,
      },
      data: {
        status: "PAID",
      },
    });
    console.log("✅ Status updated to PAID:", updatedInvoice);
    return updatedInvoice;
  } catch (error) {
    console.error("❌ Error updating invoice status:", error);
    throw error;
  }
}

///////////////////////






