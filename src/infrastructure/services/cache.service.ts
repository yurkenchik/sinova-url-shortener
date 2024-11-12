import {ForbiddenException, Injectable, OnModuleDestroy, OnModuleInit} from "@nestjs/common";
import Redis from "ioredis";
import {ConfigService} from "@nestjs/config";

@Injectable()
export class CacheService implements OnModuleInit, OnModuleDestroy {
    private redisClient: Redis;

    constructor(
        private readonly configService: ConfigService,
    ) {
        this.redisClient = new Redis(this.configService.get<string>("REDIS_URL"));
    }

    onModuleInit(): void {
        this.redisClient.on("connect", () => {
            console.log("Connected to redis");
        })

        this.redisClient.on("error", (error) => {
            console.error("Redis error", error);
        })
    }

    onModuleDestroy(): void {
        this.redisClient.disconnect();
    }

    async setValue(
        key: string,
        value: string,
        expirationTime: number = 3600
    ): Promise<void> {
        await this.redisClient.set(key, value, "EX", expirationTime);
    }

    async getValue(key: string): Promise<string> {
        return this.redisClient.get(key);
    }

    async rateLimit(
        ipAddress: string,
        limit: number = 10,
        duration: number = 60
    ): Promise<void> {
        const key = `rate-limit:${ipAddress}`;
        const requests = await this.redisClient.incr(key);

        if (requests === 1) {
            await this.redisClient.expire(key, duration);
        }

        if (requests > limit) {
            throw new ForbiddenException(`Rate limit exceeded. Try again later.`);
        }
    }
}