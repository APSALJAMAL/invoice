import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/utils/db';
import { auth } from '@/auth';

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
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

  try {
    await prisma.user.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[DELETE_USER_ERROR]', error);
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
  }
}
