import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth'; // adjust based on your file location
import prisma from '@/app/utils/db';

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { name: true, email: true, address: true, image: true,role: true, },
  });

  return NextResponse.json(user);
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { name, address, image } = body;

  try {
    await prisma.user.update({
      where: { email: session.user.email },
      data: { name, address, image },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
