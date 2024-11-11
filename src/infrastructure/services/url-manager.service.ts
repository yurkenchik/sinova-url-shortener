import {Injectable} from "@nestjs/common";
import {InjectModel} from "@nestjs/mongoose";
import {Url, UrlSchema} from "../../domain/schemas/url.schema";
import {Model} from "mongoose";
import {CacheService} from "./cache.service";
import {UrlNotFoundException} from "../../common/exceptions/404/url-not-found.exception";
import {generateShortCode} from "../../common/helpers/code-generator";
import {UrlStatisticsResponseDto} from "../../domain/dto/url-statistics-response.dto";
import {CreateShortUrlDto} from "../../domain/dto/create-short-url.dto";
import {UrlResponseDto} from "../../domain/dto/url-response.dto";

@Injectable()
export class UrlManagerService {
    constructor(
        @InjectModel(Url.name)
        private readonly urlModel: Model<Url>,
        private readonly cacheService: CacheService
    ) {}

    async getUrl(shortCode: string): Promise<UrlResponseDto> {
        let longUrl = await this.cacheService.getValue(shortCode);

        if (!longUrl) {
            const url = await this.urlModel.findOne({ shortCode });
            if (!url) {
                throw new UrlNotFoundException();
            }

            longUrl = url.longUrl;
            await this.cacheService.setValue(shortCode, longUrl);
        }

        await this.urlModel.updateOne({ shortCode }, {
            $inc: { handleClicksCounter: 1 }
        });
        return { url: longUrl };
    }

    async shortenUrl(createShortUrlDto: CreateShortUrlDto): Promise<UrlResponseDto> {
        const shortCode = generateShortCode();
        const { longUrl } = createShortUrlDto;

        const url = new this.urlModel({ shortCode, longUrl });
        await url.save();

        await this.cacheService.setValue(shortCode, longUrl);
        return { url: `http://short.ly/${shortCode}` };
    }

    async getUrlStatistics(shortCode: string): Promise<UrlStatisticsResponseDto> {
        const url = await this.urlModel.findOne({ shortCode });
        if (!url) {
            throw new UrlNotFoundException();
        }

        return {
            handleClicksCounter: url.handleClicksCounter,
            longUrl: url.longUrl
        };
    }
}