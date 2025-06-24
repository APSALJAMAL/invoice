// app/api/admin/users/route.ts

import { NextResponse } from 'next/server';
import prisma from '@/app/utils/db';
import { auth } from '@/auth';

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const currentUser = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (currentUser?.role !== 'ADMIN' && currentUser?.role !== 'OWNER') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    include: {
      details: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(users);
}
