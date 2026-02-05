import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

// GET /api/users/[userId]/store - Get the store associated with a user
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const awaitedParams = await params;
    const { userId } = await auth();
    const requestedUserId = awaitedParams.userId;

    if (!userId || userId !== requestedUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the user's store
    const userWithStore = await prisma.user.findUnique({
      where: { id: userId },
      select: { stores: { select: { id: true } } }
    });

    if (!userWithStore || userWithStore.stores.length === 0) {
      return NextResponse.json({ storeId: null }, { status: 200 });
    }

    const storeId = userWithStore.stores[0]!.id;

    return NextResponse.json({ storeId });
  } catch (e) {
    console.error("API_USERS_USERID_STORE_GET_ERROR:", e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}