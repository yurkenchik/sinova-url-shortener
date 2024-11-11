import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {UrlManagerModule} from "../modules/url-manager.module";
import {CacheModule} from "../modules/cache.module";
import {ConfigModule, ConfigService} from "@nestjs/config";
import {MongooseModule} from "@nestjs/mongoose";

@Module({
    imports: [
        UrlManagerModule,
        CacheModule,
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        MongooseModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                uri: configService.get<string>("MONGO_DB_URI")
            })
        })
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
