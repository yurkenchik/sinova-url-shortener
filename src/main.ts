import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import {DocumentBuilder, SwaggerModule} from "@nestjs/swagger";

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    const PORT = 9000

    const swaggerConfig = new DocumentBuilder()
        .setTitle("Url Shortener API")
        .setVersion("1.0")
        .build();

    const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup("api/docs", app, swaggerDocument);

    app.setGlobalPrefix("api");

    await app.listen(PORT, () => {
        console.log(`Url shortener server has been started on PORT: ${PORT}`);
    })
}
bootstrap();
