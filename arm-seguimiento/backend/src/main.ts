import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module.js';

/**
 * Punto de entrada de la API.
 *
 * - Todas las rutas quedan bajo el prefijo `/api`.
 * - `ValidationPipe` valida los cuerpos con los DTO: descarta campos desconocidos y los rechaza.
 * - La documentación interactiva (Swagger) se publica en `/api/docs`, salvo en producción.
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
  );
  // En desarrollo el frontend usa un proxy; esto cubre el acceso directo desde ng serve.
  app.enableCors({ origin: ['http://localhost:4200'] });

  if (process.env.NODE_ENV !== 'production') {
    const configuracion = new DocumentBuilder()
      .setTitle('Sistema de seguimiento y fidelización de tratamientos')
      .setDescription(
        'API del Centro Médico Vida Norte SpA. El doctor envía recomendaciones a sus pacientes y el ' +
          'paciente las lee y confirma la lectura. Para probar las rutas protegidas, inicie sesión en ' +
          '`POST /api/auth/login`, copie el `accessToken` y péguelo en el botón Authorize.',
      )
      .setVersion('1.0')
      .addBearerAuth({
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Token obtenido en POST /api/auth/login.',
      })
      .build();
    SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, configuracion), {
      useGlobalPrefix: true,
      customSiteTitle: 'API Vida Norte',
      swaggerOptions: { persistAuthorization: true },
    });
  }

  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
