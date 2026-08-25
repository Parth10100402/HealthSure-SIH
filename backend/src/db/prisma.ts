// HealthSure — Prisma Client Instance
// backend/src/db/prisma.ts

import { PrismaClient } from '@prisma/client';

let prismaInstance: PrismaClient | null = null;

export function getPrisma(): PrismaClient | null {
  if (prismaInstance) return prismaInstance;
  if (process.env.DATABASE_URL) {
    try {
      prismaInstance = new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
      });
      return prismaInstance;
    } catch (err) {
      console.warn('[Prisma] Initialization error:', err);
    }
  }
  return null;
}
