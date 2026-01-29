import { prisma } from '../lib/prisma.ts'

async function main() {
    console.log('Running demo Prisma script')

    const user = await prisma.user.create({
        data: {
            email: `demo+${Date.now()}@example.com`,
            role: 'USER',
        },
    })
    console.log('Created user:', user.id, user.email)

    const store = await prisma.store.create({
        data: {
            name: 'Demo Store',
            subdomain: `demo-${Date.now()}`,
            userId: user.id,
        },
    })
    console.log('Created store:', store.id, store.subdomain)

    const product = await prisma.product.create({
        data: {
            storeId: store.id,
            name: 'Demo Product',
            description: 'A product created by demo script',
            images: [],
            type: 'PHYSICAL',
        },
    })
    console.log('Created product:', product.id, product.name)

    const stores = await prisma.store.findMany({
        include: { products: true, user: true },
        take: 5,
    })
    console.log('Recent stores (sample):', JSON.stringify(stores, null, 2))

    await prisma.$disconnect()
}

main().catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
})
