import { Body, Controller, Get, HttpCode, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { LoginRespuestaDto } from './auth.respuestas.js';
import { AuthService } from './auth.service.js';
import { CurrentUser, Public } from './decorators.js';
import { LoginDto } from './login.dto.js';
import { UsuarioAutenticado } from './usuario-autenticado.js';

/** Rutas de autenticación bajo `/api/auth`. */
@ApiTags('Autenticación')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  /** Inicia sesión. Es la única ruta pública de la API. */
  @Public()
  @Post('login')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Iniciar sesión',
    description:
      'Comprueba el RUT y la contraseña. Si son correctos devuelve un token JWT con vigencia de 8 horas, ' +
      'que debe enviarse en el encabezado `Authorization: Bearer <token>` en las demás rutas.',
  })
  @ApiOkResponse({ type: LoginRespuestaDto, description: 'Credenciales correctas.' })
  @ApiBadRequestResponse({ description: 'Cuerpo inválido o RUT con dígito verificador incorrecto.' })
  @ApiUnauthorizedResponse({
    description: 'RUT o contraseña incorrectos. El mensaje es el mismo si el usuario no existe o está inactivo.',
  })
  login(@Body() dto: LoginDto): Promise<LoginRespuestaDto> {
    return this.auth.login(dto.rut, dto.password);
  }

  /** Devuelve quién es el usuario según la base de datos. El frontend lo usa para confirmar la sesión. */
  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Usuario autenticado',
    description:
      'Devuelve el identificador, el rol y el nombre que figuran en la base de datos. ' +
      'Sirve para confirmar una sesión guardada en el navegador.',
  })
  @ApiOkResponse({ type: UsuarioAutenticado })
  @ApiUnauthorizedResponse({ description: 'Sin token, token inválido o vencido, o usuario inactivo.' })
  me(@CurrentUser() usuario: UsuarioAutenticado): UsuarioAutenticado {
    return usuario;
  }
}
