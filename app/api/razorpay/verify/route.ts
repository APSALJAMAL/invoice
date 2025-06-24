import prisma from '@/app/utils/db';
import { updateStatusDone } from '@/app/actions';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const {
      invoiceId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = await req.json();

    if (
      !invoiceId ||
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Fetch invoice with user's Razorpay secret
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

    if (!invoice || invoice.verify !== razorpay_order_id) {
      return NextResponse.json(
        { success: false, error: 'Invalid order ID or invoice not found' },
        { status: 400 }
      );
    }

    const secret = invoice.User?.details?.secret;

    if (!secret) {
      console.error('❌ Razorpay secret not found in user details');
      return NextResponse.json(
        { success: false, error: 'Missing Razorpay credentials' },
        { status: 500 }
      );
    }

    // Create expected signature from payload
    const payload = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');

    const isValid = expectedSignature === razorpay_signature;

    if (!isValid) {
      console.warn('❌ Signature mismatch');
      return NextResponse.json(
        { success: false, error: 'Signature mismatch' },
        { status: 403 }
      );
    }

    // ✅ Update invoice status to 'PAID'
    await updateStatusDone(invoiceId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ Error in Razorpay verify route:', error);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
