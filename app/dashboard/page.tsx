import { auth } from '@clerk/nextjs/server'
import prisma from  '../../lib/prisma'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
    const { userId } = await auth();
    if (!userId) redirect('/sign-in')

    const stores = await prisma.store.findMany({ where: { userId } })

    return (
        <main className="p-8 text-gray-900">
            <h1 className="text-gray-900 text-2xl font-semibold mb-4">Dashboard</h1>
            <section className="mb-6">
                <a href="/dashboard/stores/new" className="inline-block bg-indigo-600 text-white px-4 py-2 rounded">Create Store</a>
            </section>

            <section>
                <h2 className="text-xl text-gray-900 font-medium mb-2">My Stores</h2>
                {stores.length === 0 ? (
                    <p className="text-gray-900">No stores yet. Create one to get started.</p>
                ) : (
                    <ul className="space-y-2">
                        {stores.map((s: { id: string; name: string; subdomain: string; } | undefined) => (
                            s && (
                                <li key={s.id} className="p-3 border rounded bg-white text-gray-900">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="font-semibold text-gray-900">{s.name}</div>
                                            <div className="text-sm text-gray-500">{s.subdomain}.swiftstore.dev</div>
                                        </div>
                                        <div>
                                            <a className="mr-2 text-indigo-600 hover:text-indigo-800" href={`/dashboard/stores/${s.id}`}>View</a>
                                            <a className="text-red-600 hover:text-red-800" href="#">Delete</a>
                                        </div>
                                    </div>
                                </li>
                            )
                        ))}
                    </ul>
                )}
            </section>
        </main>
    )
}
