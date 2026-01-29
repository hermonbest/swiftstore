Quickstart with Prisma ORM and PostgreSQL
PostgreSQL is a powerful, open-source relational database. In this guide, you will learn how to set up a new TypeScript project from scratch, connect it to PostgreSQL using Prisma ORM, and generate a Prisma Client for easy, type-safe access to your database.

Prerequisites
You need:

Node.js v20.19+, v22.12+, or v24.0+ installed on your machine
Basic knowledge of JavaScript or TypeScript
You also need:

A PostgreSQL database server running and accessible
Database connection details (host, port, username, password, database name)
Need a PostgreSQL database?
If you don't already have a PostgreSQL database, follow the quickstart to set up a production-ready Prisma Postgres database with Prisma ORM in a new project.

1. Create a new project
Create a project directory and navigate into it:

mkdir hello-prisma
cd hello-prisma

Initialize a TypeScript project:

npm init -y
npm install typescript tsx @types/node --save-dev
npx tsc --init

2. Install required dependencies
Install the packages needed for this quickstart:

npm install prisma @types/node @types/pg --save-dev 
npm install @prisma/client @prisma/adapter-pg pg dotenv

Here's what each package does:

prisma - The Prisma CLI for running commands like prisma init, prisma migrate, and prisma generate
@prisma/client - The Prisma Client library for querying your database
@prisma/adapter-pg - The node-postgres driver adapter that connects Prisma Client to your database
pg - The node-postgres database driver
@types/pg - TypeScript type definitions for node-postgres
dotenv - Loads environment variables from your .env file
3. Configure ESM support
Update tsconfig.json for ESM compatibility:

tsconfig.json
{
  "compilerOptions": {
    "module": "ESNext",
    "moduleResolution": "bundler",
    "target": "ES2023",
    "strict": true,
    "esModuleInterop": true,
    "ignoreDeprecations": "6.0"
  }
}

Update package.json to enable ESM:

package.json
{
  "type": "module",
}

4. Initialize Prisma ORM
You can now invoke the Prisma CLI by prefixing it with npx:

npx prisma

Next, set up your Prisma ORM project by creating your Prisma Schema file with the following command:

npx prisma init --datasource-provider postgresql --output ../generated/prisma

This command does a few things:

Creates a prisma/ directory with a schema.prisma file containing your database connection and schema models
Creates a .env file in the root directory for environment variables
Creates a prisma.config.ts file for Prisma configuration
The generated prisma.config.ts file looks like this:

prisma.config.ts
import 'dotenv/config'
import { defineConfig, env } from 'prisma/config'

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
})

The generated schema uses the ESM-first prisma-client generator with a custom output path:

prisma/schema.prisma
generator client {
  provider = "prisma-client"
  output   = "../generated/prisma"
}

datasource db {
  provider = "postgresql"
}

Update your .env file with your PostgreSQL connection string:

.env
DATABASE_URL="postgresql://username:password@localhost:5432/mydb?schema=public"

Replace the placeholders with your actual database credentials:

username: Your PostgreSQL username
password: Your PostgreSQL password
localhost:5432: Your PostgreSQL host and port
mydb: Your database name
5. Define your data model
Open prisma/schema.prisma and add the following models:

prisma/schema.prisma
generator client {
  provider = "prisma-client"
  output   = "../generated/prisma"
}

datasource db {
  provider = "postgresql"
}

model User {
  id    Int     @id @default(autoincrement())
  email String  @unique
  name  String?
  posts Post[]
}

model Post {
  id        Int     @id @default(autoincrement())
  title     String
  content   String?
  published Boolean @default(false)
  author    User    @relation(fields: [authorId], references: [id])
  authorId  Int
}

6. Create and apply your first migration
Create your first migration to set up the database tables:

npx prisma migrate dev --name init

This command creates the database tables based on your schema.

Now run the following command to generate the Prisma Client:

npx prisma generate

7. Instantiate Prisma Client
Now that you have all the dependencies installed, you can instantiate Prisma Client. You need to pass an instance of Prisma ORM's driver adapter to the PrismaClient constructor:

lib/prisma.ts
import "dotenv/config";
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../generated/prisma/client'

const connectionString = `${process.env.DATABASE_URL}`

const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })

export { prisma }

8. Write your first query
Create a script.ts file to test your setup:

script.ts
import { prisma } from './lib/prisma'

async function main() {
  // Create a new user with a post
  const user = await prisma.user.create({
    data: {
      name: 'Alice',
      email: 'alice@prisma.io',
      posts: {
        create: {
          title: 'Hello World',
          content: 'This is my first post!',
          published: true,
        },
      },
    },
    include: {
      posts: true,
    },
  })
  console.log('Created user:', user)

  // Fetch all users with their posts
  const allUsers = await prisma.user.findMany({
    include: {
      posts: true,
    },
  })
  console.log('All users:', JSON.stringify(allUsers, null, 2))
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })

Run the script:

npx tsx script.ts

You should see the created user and all users printed to the console!