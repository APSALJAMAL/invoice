// /app/api/details/me/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth'; // This is from your /auth.ts in root
import prisma from '@/app/utils/db';

export async function GET(req: NextRequest) {
  const session = await auth();

  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const details = await prisma.details.findUnique({ where: { userId } });

  if (!details) {
    return NextResponse.json({ error: 'Details not found' }, { status: 404 });
  }

  return NextResponse.json(details);
}

export async function PUT(req: NextRequest) {
  const session = await auth();

  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const data = await req.json();

  try {
    const updated = await prisma.details.upsert({
      where: { userId },
      update: data,
      create: { ...data, userId },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error('[DETAILS_UPDATE_ERROR]', err);
    return NextResponse.json({ error: 'Failed to save details' }, { status: 500 });
  }
}
