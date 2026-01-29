import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const adminPassword = await bcrypt.hash('admin123', 12);
    const instructorPassword = await bcrypt.hash('instructor123', 12);

    // Create Admin
    const admin = await prisma.user.upsert({
        where: { email: 'admin@nexus.com' },
        update: {},
        create: {
            email: 'admin@nexus.com',
            name: 'Global Admin',
            password: adminPassword,
            role: 'ADMIN',
        },
    });

    // Create Instructor
    const instructor = await prisma.user.upsert({
        where: { email: 'instructor@nexus.com' },
        update: {},
        create: {
            email: 'instructor@nexus.com',
            name: 'Elite Instructor',
            password: instructorPassword,
            role: 'INSTRUCTOR',
        },
    });

    console.log('✅ Users seeded successfully:');
    console.log('--- ADMIN ---');
    console.log('Email: admin@nexus.com');
    console.log('Pass: admin123');
    console.log('--- INSTRUCTOR ---');
    console.log('Email: instructor@nexus.com');
    console.log('Pass: instructor123');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
