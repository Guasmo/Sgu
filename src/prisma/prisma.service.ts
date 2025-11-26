import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    // Crear pool de conexiones PostgreSQL
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });

    // Crear adaptador
    const adapter = new PrismaPg(pool);

    super({ 
      adapter,
      log: ['query', 'error', 'warn'], // opcional
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}