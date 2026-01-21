import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const [adminRole, editorRole] = await Promise.all([
    prisma.role.upsert({
      where: { name: 'admin' },
      update: {},
      create: { name: 'admin' },
    }),
    prisma.role.upsert({
      where: { name: 'editor' },
      update: {},
      create: { name: 'editor' },
    }),
  ]);

  const adminEmail = 'admin@thmanyah.local';
  const adminPassword = process.env.ADMIN_PASSWORD ?? 'Admin@12345';
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      passwordHash,
      isActive: true,
    },
    create: {
      email: adminEmail,
      passwordHash,
      isActive: true,
    },
  });

  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: adminUser.id,
        roleId: adminRole.id,
      },
    },
    update: {},
    create: {
      userId: adminUser.id,
      roleId: adminRole.id,
    },
  });

  void editorRole;
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
