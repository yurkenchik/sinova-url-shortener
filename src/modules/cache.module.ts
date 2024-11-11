import {Module} from "@nestjs/common";
import {CacheService} from "../infrastructure/services/cache.service";
import {ConfigModule} from "@nestjs/config";

@Module({
    providers: [CacheService],
    imports: [ConfigModule],
    exports: [CacheService],
})
export class CacheModule {}