import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client-users';
import { Pool } from 'pg';

@Injectable()
export class PrismaUsersService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    constructor() {
        const pool = new Pool({
            connectionString: process.env.DATABASE_URL_USERS,
        });

        const adapter = new PrismaPg(pool);

        super({
            adapter,
            log: ['error', 'warn'],
        });
    }

    async onModuleInit() {
        await this.$connect();
        console.log('Connected to Users Database');
    }

    async onModuleDestroy() {
        await this.$disconnect();
        console.log('Disconnected from Users Database');
    }
}
