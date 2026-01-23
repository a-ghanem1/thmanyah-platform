import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../database/prisma.service';

type PrismaWithPrimary = PrismaService & {
  $primary?: () => PrismaService;
};

@Injectable()
export class SeedService {
  constructor(private readonly prismaService: PrismaService) {}

  async seedIfNeeded(): Promise<void> {
    const prisma =
      (this.prismaService as PrismaWithPrimary).$primary?.() ??
      this.prismaService;
    const adminEmail = 'admin@thmanyah.local';

    const existing = await prisma.user.findUnique({
      where: { email: adminEmail },
    });
    if (existing) {
      return;
    }

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
}
