// app/api/customers/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// POST /api/customers - Create a new customer
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, storeId } = body;

    // Validate required fields
    if (!email || !storeId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if customer already exists in this store
    let customer = await prisma.customer.findFirst({
      where: {
        email,
        storeId
      }
    });

    if (customer) {
      // Customer already exists, return existing customer
      return NextResponse.json(customer);
    }

    // Create new customer
    customer = await prisma.customer.create({
      data: {
        email,
        storeId
      }
    });

    return NextResponse.json(customer);
  } catch (e) {
    console.error("API_CUSTOMERS_POST_ERROR:", e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}