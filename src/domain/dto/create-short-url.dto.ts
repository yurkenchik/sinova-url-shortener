import {ApiProperty} from "@nestjs/swagger";
import {IsUrl} from "class-validator";

export class CreateShortUrlDto {
    @ApiProperty()
    @IsUrl()
    readonly longUrl: string;
}