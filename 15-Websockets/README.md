# Sección 15: Websockets

Esta sección tiene información sobre la comunicación entre cliente y servidor mediante WebSockets, puntualmente veremos:

- Nest Gateways
- Conexión
- Desconexión
- Emitir y escuchar mensajes desde el servidor y cliente
- Cliente con Vite y TS
- Autenticar conexión mediante JWTs
- Usar mismo mecanismos de autenticación previamente creado
- Desconectar sockets manualmente
- Prevenir doble conexión de usuarios autenticados.

## Inicio del proyecto

Para esta sección vamos a crear un nuevo proyecto, pero usaremos el módulo de autenticación del último proyecto. Para inicializar el nuevo backend en Nest, usaremos el siguiente comando:

```txt
$: nest new teslo-websockets
```

### Instalación de paquetes

Para evitar el linter que tiene por defecto Nest, iremos al archivo `.eslintrc.js` y eliminamos la extensión recomendada de prettier. Si queremos volverla a usar, podemos solo documentarla, pero si queremos eliminarla totalmente, desinstalamos los módulos relacionados a prettier.

También vamos a usar la documentación con el estándar de OpenAPI que usamos en la última lección de la sección anterior, por lo que realizamos la instalación con el siguiente comando:

```txt
$: pnpm i --save @nestjs/swagger
```

Algunos paquetes adicionales que hemos usado en otras lecciones los vamos a usar con el siguiente comando:

```txt
$: pnpm i -S bcrypt class-validator class-transformer joi passport-jwt pg typeorm @nestjs/config @nestjs/jwt @nestjs/passport @nestjs/typeorm
```

### Configuración de la base de datos

Para la base de datos usaremos un servicio de postgres en docker-compose, por lo que creamos el archivo `docker-compose.yml` a raíz del proyecto con el siguiente contenido:

```yaml
version: '3'

services:
    db:
        image: postgres:14.3
        container_name: ${DB_NAME}
        restart: always
        ports:
            - "${DB_PORT}:5432"
        environment:
            POSTGRES_USER: ${DB_USER}
            POSTGRES_PASSWORD: ${DB_PASSWORD}
            POSTGRES_DB: ${DB_NAME}
        volumes:
            - ./postgres:/var/lib/postgresql/data
```

### Configuración del punto de acceso al proyecto

En el archivo `main.ts` vamos a realizar la siguiente configuración para los logs, variables de usuario, prefijo global de los endpoints, validación de campos en la petición, y documentación con swagger:

```ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';


async function bootstrap () {
    const app = await NestFactory.create( AppModule );
    const logger = new Logger( 'Bootstrap' );
    const configService = new ConfigService();

    app.setGlobalPrefix( 'api' );
    app.useGlobalPipes(
        new ValidationPipe( {
            whitelist: true,
            forbidNonWhitelisted: true
        } )
    );

    const swaggerConfig = new DocumentBuilder()
        .setTitle( 'Teslo WebSockets' )
        .setDescription( 'Teslo Chat with Websockets' )
        .setVersion( '1.0' )
        .build();

    const document = SwaggerModule.createDocument( app, swaggerConfig );
    SwaggerModule.setup( 'api', app, document );

    await app.listen( configService.get( 'PORT' ) );

    logger.log( `>> Application run in ${ await app.getUrl() }` );
}


bootstrap();
```

### Definición y validación de variables de entorno

En el archivo `.env` vamos a guardar las siguientes variables:

```.env
DB_HOST = localhost
DB_PORT = 5433
DB_USER = nest-user
DB_PASSWORD = 53CR3T_P455W0RD
DB_NAME = teslo-db

PORT = 3000
HOST_API = http://localhost:3000/api

JWT_SECRET = JWT*K3Y*S3CR3T
```

Vamos a crear una carpeta llamada `config` en donde tendremos un esquema de validación de las variables de entorno, haciendo uso del paquete `joi`:

```ts
import * as Joi from 'joi';

export const JoiValidationSchema = Joi.object( {
    DB_HOST: Joi.required().default( 'localhost' ),
    DB_PORT: Joi.number().default( 5433 ),
    DB_USER: Joi.required().default( 'postgres' ),
    DB_PASSWORD: Joi.required(),
    DB_NAME: Joi.required()
} );
```

Para apoyarnos durante el desarrollo, vamos a crear un archivo llamado `src/types/index.d.ts` en donde definiremos las variables de entorno:

```ts
declare namespace NodeJS {
    interface ProcessEnv {
        DB_HOST: string;
        DB_PORT: number;
        DB_USER: string;
        DB_PASSWORD: string;
        DB_NAME: string;
        PORT: number;
        HOST_API: string;
        JWT_SECRET: string;
    }
}
```

### Configuración global de la aplicación

En el archivo `app.module.ts` debemos realizar la configuración del `ConfigModule` y de `TypeOrmModule`:

```ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { JoiValidationSchema } from './config/joi.validation';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module( {
    imports: [
        ConfigModule.forRoot( {
            validationSchema: JoiValidationSchema
        } ),
        TypeOrmModule.forRoot( {
            type: 'postgres',
            host: process.env.DB_HOST,
            port: Number( process.env.DB_PORT ),
            database: process.env.DB_NAME,
            username: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            autoLoadEntities: true,
            synchronize: true
        } ),
        AuthModule
    ],
} )
export class AppModule { }
```

### Módulo Común

Vamos a crear un módulo para elementos comunes como el manejo de errores de la base de datos, para lo cual usamos el siguiente comando:

```txt
$: nest g mo commons --no-spec
```

Lo siguiente sera crear un servicio con el siguiente comando

```txt
$: nest g s commons/services/db-exception --no-spec --flat
```

Este servicio contendrá lo siguiente:

```ts
import { BadRequestException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common'
import { PostgreSQLErrorCodes } from '../enums/db-error-codes.enum'

@Injectable()
export class DBExceptionService {
    private static logger = new Logger( 'DBExceptionService' )

    /**
     * If the error is a NOT_NULL_VIOLATION or UNIQUE_VIOLATION, throw a BadRequestException, otherwise
     * throw an InternalServerErrorException
     * @param {any} error - any - this is the error object that is passed to the function.
     */
    public static handleDBException ( error: any ): never {
        if ( error.code === PostgreSQLErrorCodes.NOT_NULL_VIOLATION )
            throw new BadRequestException( error.detail )

        if ( error.code === PostgreSQLErrorCodes.UNIQUE_VIOLATION )
            throw new BadRequestException( error.detail )

        this.logger.error( error )
        console.error( error )
        throw new InternalServerErrorException( "Unexpected error, check server logs" )
    }
}
```

En el archivo `commons.module.ts` debemos agregar la siguiente configuración:

```ts
import { Module } from '@nestjs/common';
import { DBExceptionService } from './services/db-exception.service';

@Module( {
    providers: [ DBExceptionService ],
    exports: [ DBExceptionService ]
} )
export class CommonsModule { }
```

### Módulo de Autenticación

A continuación creamos el módulo de autenticación mediante la ayuda de `resource` sin CRUD con el siguiente comando:

```txt
$: nest g res auth --no-spec
```

En este nuevo modulo creamos un directorio para las constantes, en este caso sera un enum con los roles validos y con la meta información para los decoradores:

```ts
export const META_ROLES = 'roles';

export enum ValidRoles {
    ADMIN = 'ADMIN',
    SUPERUSER = 'SUPERUSER',
    USER = 'USER'
}
```

#### Entidad de Usuarios

Creamos un archivo para la entidad de usuarios, la cual contendrá las siguientes propiedades:

```ts
import { ApiProperty } from '@nestjs/swagger';
import { BeforeInsert, BeforeUpdate, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { ValidRoles } from '../constants';

@Entity( 'users' )
export class User {
    @ApiProperty( { uniqueItems: true } )
    @PrimaryGeneratedColumn( 'uuid' )
    id: string;

    @ApiProperty( { uniqueItems: true } )
    @Column( { type: 'text', unique: true } )
    email: string;

    @ApiProperty()
    @Column( { type: 'text', select: false } )
    password: string;

    @ApiProperty( {} )
    @Column( 'text' )
    fullName: string;

    @ApiProperty( { default: true } )
    @Column( { type: 'bool', default: true } )
    isActive: string;

    @ApiProperty( { enum: ValidRoles, isArray: true, required: false } )
    @Column( { type: 'text', array: true, default: ValidRoles.USER } )
    roles: ValidRoles[];

    @BeforeInsert()
    @BeforeUpdate()
    checkFieldsBeforeInsertOrUpdate () {
        this.email = this.email.toLowerCase().trim();
    }
}
```

#### JWTStrategy

Para la autenticación usaremos la estrategia de JWT, por lo que creamos el archivo `jwt.strategy.ts` para esta provider dentro de `strategies`:

```ts
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { InjectRepository } from "@nestjs/typeorm";
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Repository } from "typeorm";
import { User } from "../entities/user.entity";
import { IJwtPayload } from "../interfaces";

@Injectable()
export class JwtStrategy extends PassportStrategy( Strategy ) {
    constructor (
        @InjectRepository( User ) private readonly _userRepository: Repository<User>,
        configService: ConfigService
    ) {
        super( {
            secretOrKey: configService.get( 'JWT_SECRET' ),
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
        } );
    }

    async validate ( payload: IJwtPayload ): Promise<User> {
        const { id } = payload;

        const user = await this._userRepository.findOneBy( { id } );

        if ( !user ) throw new UnauthorizedException( 'Token not valid' );

        if ( !user.isActive ) throw new UnauthorizedException( 'User is inactive, talk with an admin' );

        return user;
    }
}
```

#### Configuración del módulo de autenticación

Lo siguiente es configurar el archivo `auth.module.ts` para establecer el uso del módulo de configuración, identificar la entidad `User` como una tabla en la base de datos, definir el uso de los módulos de `Passport` y `JWT` con la configuración que debe conservar el token, además de llamar el provider que creamos para la estrategia, y de exportar las configuraciones más relevantes:

```ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { User } from './entities/user.entity';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module( {
    imports: [
        ConfigModule,
        TypeOrmModule.forFeature( [
            User
        ] ),
        PassportModule.register( { defaultStrategy: 'jwt' } ),
        JwtModule.registerAsync( {
            imports: [ ConfigModule ],
            inject: [ ConfigService ],
            useFactory: ( configService: ConfigService ) => {
                return {
                    secret: configService.get( 'JWT_SECRET' ),
                    signOptions: {
                        expiresIn: '2h'
                    }
                };
            }
        } )
    ],
    controllers: [ AuthController ],
    providers: [ AuthService, JwtStrategy ],
    exports: [ TypeOrmModule, JwtStrategy, PassportModule, JwtModule ]
} )
export class AuthModule { }
```

#### DTOs (Data Transfer Object)

Es momento de crear las clases que nos permiten validar los elementos que reciben nuestros endpoint, en este caso crearemos los DTOs de creación de usuario y de login del mismo.

El archivo `create-user.dto.ts` tendrá la siguiente definición:

```ts
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class CreateUserDTO {
    @ApiProperty( { example: 'test@mail.com' } )
    @IsString()
    @IsEmail()
    email: string;

    @ApiProperty( {
        pattern: '/(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/',
        minLength: 6,
        maxLength: 50,
        example: 'P44sw0rd'
    } )
    @IsString()
    @MinLength( 6 )
    @MaxLength( 50 )
    @Matches(
        /(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
        message: 'The password must have a Uppercase, lowercase letter and a number'
    } )
    password: string;

    @ApiProperty( {
        minLength: 1,
        example: 'Name Lastname'
    } )
    @IsString()
    @MinLength( 1 )
    fullName: string;
}
```

Dentro del archivo `login-user.dto.ts` vamos a definir las siguiente clase:

```ts
import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString, Matches, MaxLength, MinLength } from "class-validator";

export class LoginUserDTO {
    @ApiProperty( { example: 'test@mail.com' } )
    @IsString()
    @IsEmail()
    email: string;

    @ApiProperty( {
        pattern: '/(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/',
        minLength: 6,
        maxLength: 50,
        example: 'P44sw0rd'
    } )
    @IsString()
    @MinLength( 6 )
    @MaxLength( 50 )
    @Matches(
        /(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
        message: 'The password must have a Uppercase, lowercase letter and a number'
    } )
    password: string;
}
```

Por último, dentro de un archivo `index.ts` que sirva como archivo barril, exportamos conjuntamente ambas clases:

```ts
export { CreateUserDTO } from "./create-user.dto";
export { LoginUserDTO } from "./login-user.dto";
```

#### Servicios de autenticación

Dentro del archivo `auth.service.ts` vamos a crear los siguiente métodos:

```ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';

import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';

import { DBExceptionService } from '../commons/services/db-exception.service';
import { CreateUserDTO, LoginUserDTO } from './dtos';
import { User } from './entities/user.entity';
import { IJwtPayload } from './interfaces';

@Injectable()
export class AuthService {
    constructor (
        @InjectRepository( User ) private readonly _userRepository: Repository<User>,
        private readonly _jwtService: JwtService
    ) { }

    private _getJwtToken ( payload: IJwtPayload ) {
        return this._jwtService.sign( payload );
    }

    async create ( createUserDto: CreateUserDTO ) {
        try {
            const { password, ...userData } = createUserDto;

            const user = this._userRepository.create( {
                ...userData,
                password: bcrypt.hashSync( password, 10 )
            } );

            await this._userRepository.save( user );

            delete user.password;

            return {
                token: this._getJwtToken( { id: user.id } ),
                user
            };
        } catch ( error ) {
            DBExceptionService.handleDBException( error );
        }
    }

    async login ( loginUserDto: LoginUserDTO ) {
        const { email, password } = loginUserDto;

        const user = await this._userRepository.findOne( {
            where: { email },
            select: { id: true, email: true, password: true }
        } );

        if ( !user || !bcrypt.compareSync( password, user.password ) )
            throw new UnauthorizedException( 'Invalid Credentials' );

        return {
            token: this._getJwtToken( { id: user.id } ),
            user
        };
    }

    checkAuthStatus ( user: User ) {
        return {
            token: this._getJwtToken( { id: user.id } ),
            user
        };
    }
}
```

#### Decorador de autenticación

Crearemos el decorador que nos permite validar el uso de un endpoint basado en sus roles, y para esto usamos el siguiente comando:

```txt
$: nest g d auth/decorators/role-protected --no-spec --flat
```

El decorador configurara la metadata que se debe pasar dentro de la petición de la siguiente manera:

```ts
import { SetMetadata } from '@nestjs/common';
import { META_ROLES, ValidRoles } from '../constants';

export const RoleProtected = ( ...args: ValidRoles[] ) => SetMetadata( META_ROLES, args );
```

Luego creamos un guard con el comando a continuación, que controle la activación de la ruta, basado en los roles que lleguen en la metadata:

```txt
$: nest g gu auth/guards/user-role --no-spec --flat
```

El guard compara los roles validos, con los roles que tiene el usuario en la base de datos:

```ts
import { BadRequestException, CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { META_ROLES } from '../constants';
import { User } from '../entities/user.entity';

@Injectable()
export class UserRoleGuard implements CanActivate {
    constructor ( private readonly _reflector: Reflector ) { }

    canActivate (
        context: ExecutionContext,
    ): boolean | Promise<boolean> | Observable<boolean> {
        const validRoles: string[] = this._reflector.get( META_ROLES, context.getHandler() );

        if ( !validRoles || !validRoles.length ) return true;

        const user: User = context.switchToHttp().getRequest().user;

        if ( !user ) throw new BadRequestException( 'User not found' );

        for ( const role of user.roles ) {
            if ( validRoles.includes( role ) ) return true;
        }

        throw new ForbiddenException( `User '${ user.fullName }' need a valid role: [${ validRoles }]` );
    }
}

```

Por último, creamos una composición de decoradores para aplicar todo lo anterior:

```txt
$: nest g d auth/decorators/auth --no-spec --flat
```

Este nuevo archivo contendrá la siguiente lógica:

```ts
import { UseGuards, applyDecorators } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ValidRoles } from '../constants';
import { UserRoleGuard } from '../guards/user-role.guard';
import { RoleProtected } from './role-protected.decorator';

export const Auth = ( ...roles: ValidRoles[] ) => {
    return applyDecorators(
        RoleProtected( ...roles ),
        UseGuards( AuthGuard(), UserRoleGuard )
    );
};
```

#### Decorador para obtención del usuario en la request

Necesitamos un decorador que nos permita a nivel de propiedad, obtener la información de un usuario que hace la petición, para ello usamos el siguiente controlador:

```txt
$: nest g d auth/decorators/get-user --no-spec --flat
```

El decorador tiene esta apariencia:

```ts
import { ExecutionContext, InternalServerErrorException, createParamDecorator } from '@nestjs/common';

export const GetUser = createParamDecorator( ( data, ctx: ExecutionContext ) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    if ( !user ) throw new InternalServerErrorException( 'User not found in request' );

    return ( !data ) ? user : user[ data ];
} );
```

#### Controlador

En el controlador contaremos inicialmente con 3 endpoints: registro, login y verificación del token:

```ts
import { Body, Controller, Get, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { Auth } from './decorators/auth.decorator';
import { User } from './entities/user.entity';
import { CreateUserDTO, LoginUserDTO } from './dtos';
import { GetUser } from './decorators/get-user.decorator';

@ApiTags( 'Auth' )
@Controller( 'auth' )
export class AuthController {
    constructor ( private readonly authService: AuthService ) { }

    @Post( 'register' )
    @ApiResponse( { status: 201, description: 'User was registered' } )
    register ( @Body() createUserDto: CreateUserDTO ) {
        return this.authService.create( createUserDto );
    }

    @Post( 'login' )
    @ApiResponse( { status: 200, description: 'Successful login' } )
    @ApiResponse( { status: 401, description: 'Invalid Credentials' } )
    login ( @Body() loginUserDto: LoginUserDTO ) {
        return this.authService.login( loginUserDto );
    }

    @Get( 'check-status' )
    @Auth()
    @ApiResponse( { status: 200, description: 'Renew token' } )
    checkAuthStatus ( @GetUser() user: User ) {
        return this.authService.checkAuthStatus( user );
    }
}
```

#### Seed

Para el momento de desarrollo vamos a crear un módulo seed con información de ejemplo que se pueda usar en las pruebas. Para esto vamos a usar el siguiente comando:

```txt
$: nest g mo seed --no-spec
```

Tendremos un archivo llamado `data/seed-data.ts` en donde ubicamos la siguiente información:

```ts
import * as bcrypt from 'bcrypt';
import { ValidRoles } from '../../auth/constants';

interface SeedUser {
    email: string;
    fullName: string;
    password: string;
    roles: ValidRoles[];
}

interface SeedData {
    users: SeedUser[];
}


export const initialData: SeedData = {
    users: [
        {
            email: "test1@mail.com",
            fullName: "Test 1",
            password: bcrypt.hashSync( "test123", 10 ),
            roles: [ ValidRoles.ADMIN ]
        },
        {
            email: "test2@mail.com",
            fullName: "Test 2",
            password: bcrypt.hashSync( "test123", 10 ),
            roles: [ ValidRoles.ADMIN, ValidRoles.USER ]
        }
    ]
};
```

Dentro del `seed.module.ts` debemos realizar la importación de los módulos necesarios para el funcionamiento del seed, en este caso el `AuthModule` en donde se ubica la entidad de usuarios:

```ts
import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { SeedController } from './seed.controller';
import { SeedService } from './seed.service';

@Module( {
    imports: [
        AuthModule
    ],
    controllers: [ SeedController ],
    providers: [ SeedService ]
} )
export class SeedModule { }
```

Creamos un servicio con los siguientes métodos:

```ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../auth/entities/user.entity';
import { initialData } from './data/seed-data';

@Injectable()
export class SeedService {
    constructor (
        @InjectRepository( User ) private readonly _userRepository: Repository<User>,
    ) { }

    async runSeed () {
        await this._deleteTables();
        await this._insertUsers();
        return 'Seed Executed';
    }

    private async _deleteTables () {

        await this._userRepository
            .createQueryBuilder()
            .delete()
            .where( {} )
            .execute();
    }

    private async _insertUsers () {
        const seedUsers = initialData.users;

        const users: User[] = [];

        seedUsers.forEach( user => {
            users.push( this._userRepository.create( user ) );
        } );

        const dbUsers = await this._userRepository.save( users );

        return dbUsers[ 0 ];
    }
}
```

Por último en el controlador añadimos la siguiente información:

```ts
import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SeedService } from './seed.service';

@ApiTags( 'Seed' )
@Controller( 'seed' )
export class SeedController {
    constructor ( private readonly seedService: SeedService ) { }

    @Get()
    executeSeed () {
        return this.seedService.runSeed();
    }
}
```

### Comandos para la ejecución del proyecto

Vamos a levantar la base de datos con el siguiente comando:

```txt
$: docker-compose up -d
```

Y levantamos el proyecto en modo desarrollo con el siguiente comando:

```txt
$: pnpm start:dev
```

Para tener los datos de prueba debemos usar el endpoint `http://localhost:3000/api/seed/`

## Websocket Gateways