import {ApiProperty} from "@nestjs/swagger";

export class UrlResponseDto {
    @ApiProperty()
    readonly url: string;
}