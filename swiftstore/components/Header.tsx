'use client'
import React from 'react'
import {
    SignInButton,
    SignUpButton,
    SignedIn,
    SignedOut,
    UserButton,
} from '@clerk/nextjs'

export default function Header() {
    return (
        <header className="flex justify-end items-center p-4 gap-4 h-16 border-b bg-white">
            <SignedOut>
                <SignInButton>
                    <button className="px-4 py-2 rounded bg-gray-100">Sign in</button>
                </SignInButton>
                <SignUpButton>
                    <button className="px-4 py-2 rounded bg-indigo-600 text-white">Sign up</button>
                </SignUpButton>
            </SignedOut>
            <SignedIn>
                <UserButton />
            </SignedIn>
        </header>
    )
}

