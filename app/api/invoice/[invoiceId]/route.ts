import prisma from "@/app/utils/db";
import { NextResponse } from "next/server";
import jsPDF from "jspdf";

export async function GET(
  request: Request,
  {
    params,
  }: {
    params: Promise<{ invoiceId: string }>;
  }
) {
  const { invoiceId } = await params;

  const data = await prisma.invoice.findUnique({
    where: {
      id: invoiceId,
    },
    select: {
      invoiceName: true,
      id:true,
      invoiceNumber: true,
      currency: true,
      fromName: true,
      fromEmail: true,
      fromAddress: true,
      clientName: true,
      clientAddress: true,
      clientEmail: true,
      date: true,
      dueDate: true,
      total: true,
      note: true,
      items: {
        select: {
          description: true,
          quantity: true,
          rate: true,
        },
      },
    },
  });

  if (!data) {
    return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  }

  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  pdf.setFont("helvetica");

  // Header
  pdf.setFontSize(24);
  pdf.text(data.invoiceName, 20, 20);
  pdf.setFontSize(10);
  pdf.text(`Invoice ID: ${data.id}`, 20, 25);

  // From section
  pdf.setFontSize(12);
  pdf.text("From", 20, 40);
  pdf.setFontSize(10);
  pdf.text([data.fromName, data.fromEmail, data.fromAddress], 20, 45);

  // Client section
  pdf.setFontSize(12);
  pdf.text("Bill to", 20, 70);
  pdf.setFontSize(10);
  pdf.text([data.clientName, data.clientEmail, data.clientAddress], 20, 75);

  // Invoice details
  pdf.setFontSize(10);
  pdf.text(`Invoice Number: #${data.invoiceNumber}`, 120, 40);
  pdf.text(
    `Date: ${new Intl.DateTimeFormat("en-US", { dateStyle: "long" }).format(
      data.date
    )}`,
    120,
    45
  );
  pdf.text(`Due Date: Net ${data.dueDate}`, 120, 50);

  // Table header
  pdf.setFont("helvetica", "bold");
  pdf.text("Description", 20, 100);
  pdf.text("Quantity", 100, 100);
  pdf.text("Rate", 130, 100);
  pdf.text("Total", 160, 100);
  pdf.line(20, 102, 190, 102);

  // Item rows
  let currentY = 110;
  let subTotal = 0;
  pdf.setFont("helvetica", "normal");

  data.items.forEach((item) => {
    const itemTotal = item.rate * item.quantity;
    subTotal += itemTotal;

    pdf.text(item.description, 20, currentY);
    pdf.text(item.quantity.toString(), 100, currentY);
    pdf.text(`INR  ${item.rate.toFixed(2)}`, 130, currentY);
    pdf.text(`INR  ${itemTotal.toFixed(2)}`, 160, currentY);
    currentY += 10;
  });

  // GST & Totals
  const gstAmount = subTotal * 0.18;
  const grandTotal = subTotal + gstAmount;

  pdf.line(20, currentY, 190, currentY);
  currentY += 10;

  pdf.setFont("helvetica", "bold");
  pdf.text("Subtotal", 130, currentY);
  pdf.text(`INR  ${subTotal.toFixed(2)}`, 160, currentY);
  currentY += 7;

  pdf.text("GST (18%)", 130, currentY);
  pdf.text(`INR  ${gstAmount.toFixed(2)}`, 160, currentY);
  currentY += 7;

  pdf.text("Total (INR)", 130, currentY);
  pdf.text(`INR  ${grandTotal.toFixed(2)}`, 160, currentY);

  // Additional Note
  if (data.note) {
    currentY += 20;
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    pdf.text("Note:", 20, currentY);
    currentY += 5;
    pdf.text(data.note, 20, currentY);
  }

  const pdfBuffer = Buffer.from(pdf.output("arraybuffer"));

  return new NextResponse(pdfBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": "inline",
    },
  });
}
