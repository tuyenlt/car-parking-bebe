import { BadRequestException, ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import cookieParser from "cookie-parser";
import { AppModule } from "./app.module";
import { AllExceptionFilter } from "./common/filter/exception.filter";
import { LoggerService } from "./common/logger/logger.service";
import { useContainer } from "class-validator";
import { TrimBodyPipe } from "./common/pipes/trim_body.pipe";
import { ModifyPagingFilterPipe } from "./common/pipes/modify_paging_filter.pipe";
import { ResponseFormat, ResponseInterceptor } from "./common/interceptors/response.interceptor";
import { LoggingInterceptor } from "./common/interceptors/logger.interceptor";
import * as dotenv from "dotenv";

dotenv.config();


async function bootstrap() {
  const env = process.env.NODE_ENV;
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  // Filter
  app.useGlobalFilters(new AllExceptionFilter(new LoggerService()));
  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  // pipes
  app.useGlobalPipes(
    // new TrimBodyPipe(),
    // new ModifyPagingFilterPipe(),
    new ValidationPipe({
      exceptionFactory: (errors) => {
        const extractErrors = (errors: any[], prefix = ""): any[] => {
          const allErrors: any[] = [];

          errors.forEach((error) => {
            const fieldPath = prefix
              ? `${prefix}.${error.property}`
              : error.property;

            if (
              error.constraints &&
              Object.keys(error.constraints).length > 0
            ) {
              allErrors.push({
                fieldName: fieldPath,
                message: Object.values(error.constraints),
              });
            }

            if (error.children && error.children.length > 0) {
              const childErrors = extractErrors(error.children, fieldPath);
              allErrors.push(...childErrors);
            }
          });

          return allErrors;
        };

        const allErrors = extractErrors(errors);
        return new BadRequestException({
          errors: allErrors,
        });
      },
    }),
  );

  // interceptors
  app.useGlobalInterceptors(new LoggingInterceptor(new LoggerService()));
  app.useGlobalInterceptors(new ResponseInterceptor());

  // base routing
  app.setGlobalPrefix("api/v1");

  // swagger config
//   if (env !== "production") {
    const config = new DocumentBuilder()
      .addBearerAuth()
      .setVersion("1.0")
      .build();
    const document = SwaggerModule.createDocument(app, config, {
      extraModels: [ResponseFormat],
      deepScanRoutes: true,
    });
    SwaggerModule.setup("api", app, document);
//   }

  app.enableCors({
	credentials: true,
	origin: [process.env.FRONTEND_URL, "https://webhook.site"],
  });

  await app.listen(process.env.SERVER_PORT || 3000);
}

bootstrap();
