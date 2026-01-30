"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
async function main() {
    const adminPassword = await bcryptjs_1.default.hash('admin123', 12);
    const instructorPassword = await bcryptjs_1.default.hash('instructor123', 12);
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
