Install @clerk/nextjs
The Clerk Next.js SDK gives you access to prebuilt components, hooks, and helpers to make user authentication easier.

Run the following command to install the SDK:

npm
pnpm
yarn
bun
terminal

npm install @clerk/nextjs
Add clerkMiddleware() to your app
clerkMiddleware() grants you access to user authentication state throughout your app. It also allows you to protect specific routes from unauthenticated users. To add clerkMiddleware() to your app, follow these steps:

Important

If you're using Next.js ≤15, name your file middleware.ts instead of proxy.ts. The code itself remains the same; only the filename changes.

Create a proxy.ts file.

If you're using the /src directory, create proxy.ts in the /src directory.
If you're not using the /src directory, create proxy.ts in the root directory.
In your proxy.ts file, export the clerkMiddleware() helper:

proxy.ts

import { clerkMiddleware } from '@clerk/nextjs/server'

export default clerkMiddleware()

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
By default, clerkMiddleware() will not protect any routes. All routes are public and you must opt-in to protection for routes. See the clerkMiddleware() reference to learn how to require authentication for specific routes.

Add <ClerkProvider> to your app
The 
<ClerkProvider>
 component provides session and user context to Clerk's hooks and components. It's recommended to wrap your entire app at the entry point with <ClerkProvider> to make authentication globally accessible. See the 
reference docs
 for other configuration options.

Add the <ClerkProvider> component to your app's layout, as shown in the following example:

app/layout.tsx

import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

14 lines collapsed

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}
Create a header with Clerk components
You can control which content signed-in and signed-out users can see with the 
prebuilt control components
. The following example creates a header using the following components:

<SignedIn>
: Children of this component can only be seen while signed in.
<SignedOut>
: Children of this component can only be seen while signed out.
<UserButton />
: Shows the signed-in user's avatar. Selecting it opens a dropdown menu with account management options.
<SignInButton />
: An unstyled component that links to the sign-in page. In this example, since no props or environment variables are set for the sign-in URL, this component links to the Account Portal sign-in page.
<SignUpButton />
: An unstyled component that links to the sign-up page. In this example, since no props or environment variables are set for the sign-up URL, this component links to the Account Portal sign-up page.
app/layout.tsx

import type { Metadata } from 'next'
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

20 lines collapsed
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
          <header className="flex justify-end items-center p-4 gap-4 h-16">
            {/* Show the sign-in and sign-up buttons when the user is signed out */}
            <SignedOut>
              <SignInButton />
              <SignUpButton>
                <button className="bg-[#6c47ff] text-white rounded-full font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 cursor-pointer">
                  Sign Up
                </button>
              </SignUpButton>
            </SignedOut>
            {/* Show the user button when the user is signed in */}
            <SignedIn>
              <UserButton />
            </SignedIn>
          </header>
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}
Run your project
Run your project with the following command:

npm
pnpm
yarn
bun
terminal

npm run dev
Create your first user
Visit your app's homepage at http://localhost:3000.

Select "Sign up" on the page and authenticate to create your first user.

To make configuration changes to your Clerk development instance, claim the Clerk keys that were generated for you by selecting Claim your application in the bottom right of your app. This will associate the application with your Clerk account.