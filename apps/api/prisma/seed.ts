import { PrismaClient, PlantTypeEnum } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    const adminEmail = 'admin@example.com';
    const adminPassword = 'Admin_1234!';

    const existingAdmin = await prisma.user.findUnique({
        where: { email: adminEmail }
    });

    if (!existingAdmin) {
        const hashedPassword = await bcrypt.hash(adminPassword, 10);
        await prisma.user.create({
            data: {
                email: adminEmail,
                password_hash: hashedPassword,
                role: 'ADMIN'
            }
        });
        console.log('✅ Admin user created');
    } else {
        console.log('ℹ️ Admin user already exists');
    }

    // Seed Plant Templates
    const templates = [
        { name: 'Northern Lights Auto', strain: 'Northern Lights', plant_type: 'AUTOFLOWER', breeder: 'Sensi Seeds', flowering_weeks: 9 },
        { name: 'White Widow Photo', strain: 'White Widow', plant_type: 'PHOTOPERIOD', breeder: 'Green House Seeds', flowering_weeks: 9 },
        { name: 'Blue Dream Photo', strain: 'Blue Dream', plant_type: 'PHOTOPERIOD', breeder: 'Humboldt', flowering_weeks: 10 },
        { name: 'Gorilla Glue Auto', strain: 'Gorilla Glue #4', plant_type: 'AUTOFLOWER', breeder: 'Autoflower Co', flowering_weeks: 10 }
    ];

    for (const t of templates) {
        const existing = await prisma.plantTemplate.findFirst({ where: { name: t.name } });
        if (!existing) {
            await prisma.plantTemplate.create({
                data: {
                    name: t.name,
                    strain: t.strain,
                    plant_type: t.plant_type as PlantTypeEnum,
                    breeder: t.breeder,
                    flowering_weeks: t.flowering_weeks
                }
            });
            console.log(`🌱 Created template: ${t.name}`);
        }
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
