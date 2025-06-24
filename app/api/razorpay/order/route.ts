import prisma from '@/app/utils/db';
import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

export async function POST(req: Request) {
  try {
    const { invoiceId } = await req.json();

    // Validate invoiceId
    if (!invoiceId || typeof invoiceId !== 'string') {
      console.warn('[RAZORPAY_ORDER] Invalid or missing invoiceId:', invoiceId);
      return NextResponse.json({ error: 'Missing or invalid invoiceId' }, { status: 400 });
    }

    // Fetch invoice along with user and Razorpay details
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        User: {
          include: {
            details: true,
          },
        },
      },
    });

    if (!invoice) {
      console.warn('[RAZORPAY_ORDER] Invoice not found:', invoiceId);
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    if (typeof invoice.total !== 'number' || isNaN(invoice.total)) {
      console.error('[RAZORPAY_ORDER] Invalid total amount:', invoice.total);
      return NextResponse.json({ error: 'Invalid invoice amount' }, { status: 400 });
    }

    const user = invoice.User;
    const details = user?.details;

    if (!details || !details.key || !details.secret) {
      console.warn('[RAZORPAY_ORDER] Razorpay credentials missing for user:', user?.id);
      return NextResponse.json({ error: 'Missing Razorpay credentials' }, { status: 400 });
    }

    const amountInPaise = Math.round(invoice.total * 100);

    // Initialize Razorpay instance
    const razorpay = new Razorpay({
      key_id: details.key,
      key_secret: details.secret,
    });

    // Create Razorpay order
    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: invoiceId,
    });

    // Save the generated orderId in invoice.verify field
    await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        verify: order.id,
      },
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: details.key,
    });
  } catch (error: any) {
    console.error('[RAZORPAY_ORDER_ERROR]', error?.message || error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
