import {HttpException, HttpStatus} from "@nestjs/common";

export class UrlNotFoundException extends HttpException {
    constructor() {
        super("Url not found", HttpStatus.NOT_FOUND);
    }
}