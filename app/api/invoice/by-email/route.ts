import prisma from "@/app/utils/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const clientEmail = searchParams.get("clientEmail");
  
    if (!clientEmail || typeof clientEmail !== "string") {
      return NextResponse.json({ error: "clientEmail is required" }, { status: 400 });
    }
  
    try {
      console.log("clientEmail:", clientEmail);
  
      const invoices = await prisma.invoice.findMany({
        where: {
          clientEmail: clientEmail.trim(),
        },
        include: {
          items: true,
          User: true,
        },
      });
  
      console.log("Found invoices:", invoices);
  
      if (!invoices || invoices.length === 0) {
        return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
      }
  
      return NextResponse.json(invoices, { status: 200 });
    } catch (error) {
      console.error("Error:", error);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
  }
  