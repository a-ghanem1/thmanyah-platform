import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { PrismaService } from '../database/prisma.service';

type SeedCategory = {
  name: string;
  slug: string;
};

type SeedEpisode = {
  title: string;
  description?: string;
  durationSeconds: number;
  audioUrl?: string;
  publishedAt?: string;
};

type SeedProgram = {
  title: string;
  description?: string;
  language: string;
  status: string;
  publishedAt?: string;
  categories: string[];
  episodes: SeedEpisode[];
};

type SeedData = {
  categories: SeedCategory[];
  programs: SeedProgram[];
};

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

    const seedData = await this.loadSeedData();
    const categoriesBySlug = new Map<string, { id: string; slug: string }>();

    for (const category of seedData.categories) {
      const savedCategory = await prisma.category.upsert({
        where: { slug: category.slug },
        update: { name: category.name },
        create: {
          name: category.name,
          slug: category.slug,
        },
      });
      categoriesBySlug.set(savedCategory.slug, {
        id: savedCategory.id,
        slug: savedCategory.slug,
      });
    }

    for (const program of seedData.programs) {
      const existingProgram = await prisma.program.findFirst({
        where: { title: program.title },
      });

      const savedProgram = existingProgram
        ? await prisma.program.update({
            where: { id: existingProgram.id },
            data: {
              description: program.description ?? null,
              language: program.language,
              status: program.status,
              publishedAt: program.publishedAt
                ? new Date(program.publishedAt)
                : null,
            },
          })
        : await prisma.program.create({
            data: {
              title: program.title,
              description: program.description ?? null,
              language: program.language,
              status: program.status,
              publishedAt: program.publishedAt
                ? new Date(program.publishedAt)
                : null,
            },
          });

      for (const slug of program.categories) {
        const category = categoriesBySlug.get(slug);
        if (!category) {
          continue;
        }
        await prisma.programCategory.upsert({
          where: {
            programId_categoryId: {
              programId: savedProgram.id,
              categoryId: category.id,
            },
          },
          update: {},
          create: {
            programId: savedProgram.id,
            categoryId: category.id,
          },
        });
      }

      for (const episode of program.episodes) {
        const existingEpisode = await prisma.episode.findFirst({
          where: {
            programId: savedProgram.id,
            title: episode.title,
          },
        });

        const episodeData = {
          title: episode.title,
          description: episode.description ?? null,
          durationSeconds: episode.durationSeconds,
          audioUrl: episode.audioUrl ?? null,
          publishedAt: episode.publishedAt
            ? new Date(episode.publishedAt)
            : null,
        };

        if (existingEpisode) {
          await prisma.episode.update({
            where: { id: existingEpisode.id },
            data: episodeData,
          });
        } else {
          await prisma.episode.create({
            data: {
              ...episodeData,
              programId: savedProgram.id,
            },
          });
        }
      }
    }
  }

  private async loadSeedData(): Promise<SeedData> {
    const candidates = [
      path.resolve(__dirname, 'seed-data.json'),
      path.resolve(process.cwd(), 'dist/shared/seed/seed-data.json'),
      path.resolve(process.cwd(), 'dist/src/shared/seed/seed-data.json'),
      path.resolve(process.cwd(), 'src/shared/seed/seed-data.json'),
    ];

    for (const candidate of candidates) {
      try {
        const contents = await fs.readFile(candidate, 'utf8');
        return JSON.parse(contents) as SeedData;
      } catch (error) {
        void error;
      }
    }

    throw new Error('Seed data file not found.');
  }
}
