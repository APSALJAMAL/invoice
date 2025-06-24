// app/api/admin/user/role/route.ts

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/utils/db';
import { auth } from '@/auth';

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { userId, role } = await req.json();

  const currentUser = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (currentUser?.role !== 'ADMIN' && currentUser?.role !== 'OWNER') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  await prisma.user.update({
    where: { id: userId },
    data: { role },
  });

  return NextResponse.json({ success: true });
}
