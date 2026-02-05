// app/api/startbutton/process/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/startbutton/process - Handle redirect from Startbutton after payment
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const paymentId = url.searchParams.get('paymentId');

    // In a real implementation, we would verify the payment status with Startbutton's API
    // For now, we'll look up the order by payment ID and redirect appropriately

    // Find the order associated with this payment
    let order = null;
    if (paymentId) {
      order = await prisma.order.findFirst({
        where: {
          paymentId: paymentId
        },
        include: {
          store: true
        }
      });
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    if (order) {
      // Redirect to the order success page for the specific store
      return NextResponse.redirect(`${baseUrl}/${order.store.subdomain}/order-success?orderId=${order.id}`);
    } else {
      // If we can't find the order, try to get subdomain from headers
      const subdomain = req.headers.get('x-store-subdomain');
      if (subdomain) {
        return NextResponse.redirect(`${baseUrl}/${subdomain}/cart?error=order_not_found`);
      }
      // Fallback to main site if no subdomain
      return NextResponse.redirect(`${baseUrl}/?error=order_not_found`);
    }
  } catch (e) {
    console.error("API_STARTBUTTON_PROCESS_ERROR:", e);
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    // Try to get subdomain from headers for error redirect
    const subdomain = req.headers.get('x-store-subdomain');
    if (subdomain) {
      return NextResponse.redirect(`${baseUrl}/${subdomain}/cart?error=payment_failed`);
    }
    return NextResponse.redirect(`${baseUrl}/?error=payment_failed`);
  }
}