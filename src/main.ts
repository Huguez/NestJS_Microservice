import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { env } from './config';

async function bootstrap() {
   const app = await NestFactory.create(AppModule);
   const logger = new Logger("Bootstrap");
   app.setGlobalPrefix("api");

   app.useGlobalPipes(
      new ValidationPipe({
         whitelist: true,
         forbidNonWhitelisted: true,
      })
   );

   await app.listen(env.PORT);
   logger.log(`App running on port: ${ env.PORT }`);
}
bootstrap();
