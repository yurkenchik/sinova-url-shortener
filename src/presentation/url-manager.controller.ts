import {ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags} from "@nestjs/swagger";
import {Body, Controller, Get, HttpStatus, Param, Post, Redirect} from "@nestjs/common";
import {UrlManagerService} from "../infrastructure/services/url-manager.service";
import {UrlResponseDto} from "../domain/dto/url-response.dto";
import {CreateShortUrlDto} from "../domain/dto/create-short-url.dto";
import {UrlStatisticsResponseDto} from "../domain/dto/url-statistics-response.dto";

@ApiTags("Url manager controller")
@Controller("url-manager")
export class UrlManagerController {
    constructor(private readonly urlManagerService: UrlManagerService) {}

    @ApiOperation({ summary: "Redirecting to url"})
    @ApiParam({ name: "shortCode", type: String })
    @ApiResponse({ type: UrlResponseDto, status: HttpStatus.OK })
    @Get(":shortCode")
    @Redirect()
    async redirectToUrl(@Param("shortCode") shortCode: string): Promise<UrlResponseDto> {
        return await this.urlManagerService.getUrl(shortCode);
    }

    @ApiOperation({ summary: "Url shorting" })
    @ApiBody({ type: CreateShortUrlDto })
    @ApiResponse({ type: UrlResponseDto, status: HttpStatus.CREATED })
    @Post()
    async shortenUrl(@Body() createShortUrlDto: CreateShortUrlDto): Promise<UrlResponseDto> {
        return this.urlManagerService.shortenUrl(createShortUrlDto);
    }

    @ApiOperation({ summary: "Getting statistics of url clicking times" })
    @ApiParam({ name: "shortCode", type: String })
    @ApiResponse({  })
    @Get('stats/:shortCode')
    async getStatistics(@Param('shortCode') shortCode: string): Promise<UrlStatisticsResponseDto> {
        return this.urlManagerService.getUrlStatistics(shortCode);
    }
}