// pages/api/details/verify.ts
import prisma from '@/app/utils/db';
import { NextRequest, NextResponse } from 'next/server';


export async function GET(req: NextRequest) {
  const fromEmail = req.nextUrl.searchParams.get('fromEmail');

  if (!fromEmail) {
    return NextResponse.json({ verified: false }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: fromEmail },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ verified: false }, { status: 404 });
    }

    const details = await prisma.details.findUnique({
      where: { userId: user.id },
      select: { verified: true },
    });

    return NextResponse.json({ verified: details?.verified ?? false });
  } catch (error) {
    console.error('Error verifying details:', error);
    return NextResponse.json({ verified: false }, { status: 500 });
  }
}
