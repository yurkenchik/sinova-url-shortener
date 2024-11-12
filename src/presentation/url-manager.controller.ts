import {ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags} from "@nestjs/swagger";
import {Body, Controller, Get, HttpStatus, Ip, Param, Post, Redirect} from "@nestjs/common";
import {UrlManagerService} from "../infrastructure/services/url-manager.service";
import {UrlResponseDto} from "../domain/dto/url-response.dto";
import {CreateShortUrlDto} from "../domain/dto/create-short-url.dto";
import {UrlStatisticsResponseDto} from "../domain/dto/url-statistics-response.dto";
import {CacheService} from "../infrastructure/services/cache.service";

@ApiTags("Url manager controller")
@Controller("url-manager")
export class UrlManagerController {
    constructor(
        private readonly urlManagerService: UrlManagerService,
        private readonly cacheService: CacheService,
    ) {}

    @ApiOperation({ summary: "Redirecting to url"})
    @ApiParam({ name: "shortCode", type: String })
    @ApiResponse({ type: UrlResponseDto, status: HttpStatus.OK })
    @Get(":shortCode")
    @Redirect()
    async redirectToUrl(@Param("shortCode") shortCode: string, @Ip() ipAddress: string): Promise<UrlResponseDto> {
        await this.cacheService.rateLimit(ipAddress);
        return await this.urlManagerService.getUrl(shortCode);
    }

    @ApiOperation({ summary: "Url shorting" })
    @ApiBody({ type: CreateShortUrlDto })
    @ApiResponse({ type: UrlResponseDto, status: HttpStatus.CREATED })
    @Post("shortenUrl")
    async shortenUrl(
        @Body() createShortUrlDto: CreateShortUrlDto,
        @Ip() ipAddress: string
    ): Promise<UrlResponseDto> {
        await this.cacheService.rateLimit(ipAddress);
        return this.urlManagerService.shortenUrl(createShortUrlDto);
    }

    @ApiOperation({ summary: "Getting statistics of url clicking times" })
    @ApiParam({ name: "shortCode", type: String })
    @ApiResponse({ type: UrlStatisticsResponseDto, status: HttpStatus.OK  })
    @Get('stats/:shortCode')
    async getStatistics(@Param('shortCode') shortCode: string): Promise<UrlStatisticsResponseDto> {
        return this.urlManagerService.getUrlStatistics(shortCode);
    }
}