import {Injectable, OnModuleDestroy, OnModuleInit} from "@nestjs/common";
import Redis from "ioredis";
import {ConfigService} from "@nestjs/config";

@Injectable()
export class CacheService implements OnModuleInit, OnModuleDestroy {
    private redisClient: Redis;

    constructor(
        private readonly configService: ConfigService,
    ) {
        this.redisClient = new Redis(this.configService.get<string>("REDIS_URL"), {
            host: this.configService.get<string>("REDIS_HOST"),
            port: this.configService.get<number>("REDIS_PORT"),
            password: this.configService.get<string>("REDIS_PASSWORD"),
        });
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

    async delete(key: string): Promise<void> {
        await this.redisClient.del(key);
    }
}