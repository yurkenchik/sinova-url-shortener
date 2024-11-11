import {Module} from "@nestjs/common";
import {UrlManagerService} from "../infrastructure/services/url-manager.service";
import {UrlManagerController} from "../presentation/url-manager.controller";
import {MongooseModule} from "@nestjs/mongoose";
import {Url, UrlSchema} from "../domain/schemas/url.schema";
import {CacheModule} from "./cache.module";

@Module({
    providers: [UrlManagerService],
    controllers: [UrlManagerController],
    imports: [
        MongooseModule.forFeature([{ name: Url.name, schema: UrlSchema }]),
        CacheModule
    ],
    exports: [UrlManagerService]
})
export class UrlManagerModule {}