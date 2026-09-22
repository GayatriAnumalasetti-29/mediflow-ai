import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error']
});

export const connectDatabase = async (): Promise<boolean> => {
  try {
    await prisma.$connect();
    console.log('✅ [Supabase / PostgreSQL] Successfully connected to Database via Prisma ORM.');
    return true;
  } catch (err: any) {
    console.warn(`⚠️ [Database Warning] Could not connect to external PostgreSQL/Supabase: ${err.message}`);
    console.warn('ℹ️ [MediFlow AI] Seamlessly falling back to active In-Memory Clinical Store.');
    return false;
  }
};
