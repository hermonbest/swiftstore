"use client"
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function NewStorePage() {
    const [name, setName] = useState('')
    const [subdomain, setSubdomain] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        setError(null)
        try {
            const res = await fetch('/api/stores', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, subdomain }),
            })
            if (!res.ok) throw new Error(await res.text())
            router.push('/dashboard')
        } catch (err: any) {
            setError(err.message || 'An error occurred')
        } finally {
            setLoading(false)
        }
    }

    return (
        <main className="p-8 text-gray-900">
            <h1 className="text-gray-900 text-2xl font-semibold mb-4">Create Store</h1>
            <form onSubmit={onSubmit} className="space-y-4 max-w-md">
                <div>
                    <label className="block text-sm font-medium mb-1 text-gray-900">Store Name</label>
                    <input value={name} onChange={(e) => setName(e.target.value)} className="w-full border px-3 py-2 rounded text-gray-900" />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1 text-gray-900">Subdomain</label>
                    <div className="flex gap-2">
                        <input value={subdomain} onChange={(e) => setSubdomain(e.target.value)} className="flex-1 border px-3 py-2 rounded text-gray-900" />
                        <span className="inline-flex items-center px-3 py-2 text-gray-900 bg-gray-100 rounded">.swiftstore.dev</span>
                    </div>
                </div>
                {error && <div className="text-red-600">{error}</div>}
                <div>
                    <button disabled={loading} className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">{loading ? 'Creating...' : 'Create'}</button>
                </div>
            </form>
        </main>
    )
}
