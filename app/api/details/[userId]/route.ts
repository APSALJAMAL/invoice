import prisma from '@/app/utils/db';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/details/[userId]
export async function GET(_: NextRequest, { params }: { params: { userId: string } }) {
  const { userId } = params;

  try {
    const details = await prisma.details.findUnique({
      where: { userId },
    });

    if (!details) {
      return NextResponse.json({ error: 'Details not found' }, { status: 404 });
    }

    return NextResponse.json(details);
  } catch (error) {
    console.error('[DETAILS_GET_ERROR]', error);
    return NextResponse.json({ error: 'Failed to fetch details' }, { status: 500 });
  }
}

// POST /api/details/[userId]
export async function POST(req: NextRequest, { params }: { params: { userId: string } }) {
  const { userId } = params;

  const {
    key,
    secret,
    verified = false,
    organizationId,
    organizationName,
    organizationAddress,
    gstNumber,
  } = await req.json();

  try {
    const newDetails = await prisma.details.create({
      data: {
        key,
        secret,
        verified,
        organizationId,
        organizationName,
        organizationAddress,
        gstNumber,
        userId,
      },
    });

    return NextResponse.json(newDetails, { status: 201 });
  } catch (error) {
    console.error('[DETAILS_CREATE_ERROR]', error);
    return NextResponse.json({ error: 'Details already exist or invalid data' }, { status: 400 });
  }
}

// PUT /api/details/[userId]
export async function PUT(req: NextRequest, { params }: { params: { userId: string } }) {
  const { userId } = params;

  const {
    key,
    secret,
    verified,
    organizationId,
    organizationName,
    organizationAddress,
    gstNumber,
  } = await req.json();

  try {
    const updatedDetails = await prisma.details.update({
      where: { userId },
      data: {
        key,
        secret,
        verified,
        organizationId,
        organizationName,
        organizationAddress,
        gstNumber,
      },
    });

    return NextResponse.json(updatedDetails);
  } catch (error) {
    console.error('[DETAILS_UPDATE_ERROR]', error);
    return NextResponse.json({ error: 'Details not found or invalid update' }, { status: 400 });
  }
}

// DELETE /api/details/[userId]
export async function DELETE(_: NextRequest, { params }: { params: { userId: string } }) {
  const { userId } = params;

  try {
    await prisma.details.delete({
      where: { userId },
    });

    return NextResponse.json({ message: 'Details deleted successfully' });
  } catch (error) {
    console.error('[DETAILS_DELETE_ERROR]', error);
    return NextResponse.json({ error: 'Details not found' }, { status: 404 });
  }
}
