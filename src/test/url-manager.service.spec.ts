import { Test, TestingModule } from "@nestjs/testing";
import { getModelToken } from "@nestjs/mongoose";
import { CacheService } from "../infrastructure/services/cache.service";
import { UrlManagerService } from "../infrastructure/services/url-manager.service";
import { Url } from "../domain/schemas/url.schema";
import { UrlNotFoundException } from "../common/exceptions/404/url-not-found.exception";
import { generateShortCode } from "../common/helpers/code-generator";

describe('UrlManagerService', () => {
    let service: UrlManagerService;
    let cacheService: CacheService;
    let urlModel: any;

    beforeEach(async () => {
        urlModel = {
            findOne: jest.fn(),
            updateOne: jest.fn(),
            save: jest.fn(),
        };
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UrlManagerService,
                {
                    provide: getModelToken(Url.name),
                    useValue: urlModel,
                },
                {
                    provide: CacheService,
                    useValue: {
                        getValue: jest.fn(),
                        setValue: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<UrlManagerService>(UrlManagerService);
        cacheService = module.get<CacheService>(CacheService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('getUrl', () => {
        it('should return long URL from cache', async () => {
            const shortCode = 'abc123';
            const longUrl = 'https://example.com';
            jest.spyOn(cacheService, 'getValue').mockResolvedValue(longUrl);

            const result = await service.getUrl(shortCode);

            expect(cacheService.getValue).toHaveBeenCalledWith(shortCode);
            expect(result).toEqual({ url: longUrl });
        });

        it('should return long URL from database if not in cache', async () => {
            const shortCode = 'abc123';
            const longUrl = 'https://example.com';
            jest.spyOn(cacheService, 'getValue').mockResolvedValue(null);
            jest.spyOn(urlModel, 'findOne').mockResolvedValue({ longUrl });

            const result = await service.getUrl(shortCode);

            expect(urlModel.findOne).toHaveBeenCalledWith({ shortCode });
            expect(cacheService.setValue).toHaveBeenCalledWith(shortCode, longUrl);
            expect(result).toEqual({ url: longUrl });
        });

        it('should throw UrlNotFoundException if URL not found', async () => {
            const shortCode = 'abc123';
            jest.spyOn(cacheService, 'getValue').mockResolvedValue(null);
            jest.spyOn(urlModel, 'findOne').mockResolvedValue(null);

            await expect(service.getUrl(shortCode)).rejects.toThrow(UrlNotFoundException);
        });

        it('should increment handleClicksCounter', async () => {
            const shortCode = 'abc123';
            const longUrl = 'https://example.com';
            jest.spyOn(cacheService, 'getValue').mockResolvedValue(longUrl);

            await service.getUrl(shortCode);

            expect(urlModel.updateOne).toHaveBeenCalledWith(
                { shortCode },
                { $inc: { handleClicksCounter: 1 } }
            );
        });
    });

    describe('getUrlStatistics', () => {
        it('should return statistics for a valid short code', async () => {
            const shortCode = 'abc123';
            const handleClicksCounter = 10;
            const longUrl = 'https://example.com';
            jest.spyOn(urlModel, 'findOne').mockResolvedValue({ handleClicksCounter, longUrl });

            const result = await service.getUrlStatistics(shortCode);

            expect(urlModel.findOne).toHaveBeenCalledWith({ shortCode });
            expect(result).toEqual({
                handleClicksCounter,
                longUrl,
            });
        });

        it('should throw UrlNotFoundException if URL not found for statistics', async () => {
            const shortCode = 'abc123';
            jest.spyOn(urlModel, 'findOne').mockResolvedValue(null);

            await expect(service.getUrlStatistics(shortCode)).rejects.toThrow(UrlNotFoundException);
        });
    });
});
