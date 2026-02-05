// app/api/startbutton/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// POST /api/startbutton/webhook - Handle Startbutton payment webhook
export async function POST(req: NextRequest) {
  try {
    // In a real implementation, we would validate the webhook signature here
    // For now, we'll skip this for simplicity
    
    const body = await req.json();
    
    // Log the webhook event for debugging
    console.log('Startbutton webhook received:', body);
    
    // Extract payment information from the webhook
    const { 
      event_type, 
      data: { 
        id: paymentId, 
        status: paymentStatus, 
        reference: orderId,
        amount,
        customer: { email: customerEmail }
      } 
    } = body;

    // Handle different event types
    switch (event_type) {
      case 'payment.success':
        // Update the order status to PAID
        await prisma.order.update({
          where: { id: orderId },
          data: { 
            status: 'PAID',
            paymentId: paymentId
          }
        });
        
        // Optionally, send a notification to the merchant
        console.log(`Payment successful for order ${orderId}. Payment ID: ${paymentId}`);
        
        break;
        
      case 'payment.failed':
        // Update the order status to PENDING (or FAILED depending on business logic)
        // We might want to restore stock in this case
        await prisma.order.update({
          where: { id: orderId },
          data: { 
            status: 'PENDING' // Or 'FAILED' depending on business logic
          }
        });
        
        console.log(`Payment failed for order ${orderId}. Payment ID: ${paymentId}`);
        
        break;
        
      case 'payment.cancelled':
        // Update the order status and potentially restore stock
        await prisma.order.update({
          where: { id: orderId },
          data: { 
            status: 'PENDING' // Or 'CANCELLED' depending on business logic
          }
        });
        
        console.log(`Payment cancelled for order ${orderId}. Payment ID: ${paymentId}`);
        
        break;
        
      default:
        console.log(`Unhandled event type: ${event_type}`);
        break;
    }

    // Return success response to acknowledge receipt
    return NextResponse.json({ 
      status: 'success',
      message: 'Webhook processed successfully'
    });
  } catch (e) {
    console.error("API_STARTBUTTON_WEBHOOK_ERROR:", e);
    return NextResponse.json({ 
      status: 'error',
      message: 'Webhook processing failed'
    }, { status: 500 });
  }
}