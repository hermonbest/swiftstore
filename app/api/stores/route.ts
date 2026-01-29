import { NextRequest, NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server' // Add currentUser
import prisma from '@/lib/prisma'

export async function POST(req: NextRequest) {
    try {
        const { userId } = await auth()
        const user = await currentUser() // Fetch full Clerk user details

        if (!userId || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await req.json()
        const { name, subdomain } = body
        
        // Get primary email from Clerk
        const email = user.emailAddresses[0]?.emailAddress 
        if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 })

        // FIX: Provide the missing email field to satisfy your Prisma Schema
        await prisma.user.upsert({
            where: { id: userId },
            update: { email }, // Update email if it changed
            create: { 
                id: userId, 
                email: email // Now this satisfies the "Argument email is missing" error
            }, 
        })

        const existing = await prisma.store.findUnique({ where: { subdomain } })
        if (existing) return NextResponse.json({ error: 'Subdomain already taken' }, { status: 409 })

        const store = await prisma.store.create({ 
            data: { name, subdomain, userId } 
        })
        
        return NextResponse.json(store)
    } catch (e) {
        console.error("API_STORES_POST_ERROR:", e)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}