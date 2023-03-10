# Sección 13: Autenticación de autorización

Esta es una de las secciones más grandes del curso y está cargada de muchos conceptos nuevos, mi recomendación tratar de digerirla en dos jornadas de estudio en lugar de intentar verla completamente en una sola corrida.

Puntualmente veremos:

- Autenticación
- Autorización
- Json Web Tokens
- Hash de contraseñas
- Nest Passport
- Módulos asíncronos
- Protección de rutas
- Custom Method Decorators
- Custom Class Decorators
- Custom Property Decorators
- Enlazar usuarios con productos
- Bearer Tokens
- Y mucho más

## Continuación de proyecto

Vamos a seguir usando el proyecto de la sección anterior, por lo que podemos usar el siguiente comando para copiarlo:

```txt
$: cp -r 12-Carga_archivos/teslo-shop 13-Autenticacion_de_autorizacion/
```

Hacemos la instalación de los `node_modules` con el siguiente comando:

```txt
$: pnpm install
```

Levantamos la base de datos con el comando:

```txt
$: docker-compose up -d
```

Y levantamos el proyecto con el siguiente comando:

```txt
$: pnpm start:dev
```

En caso de no tener registros en la base de datos, vamos a ejecutar el siguiente endpoint: `http://localhost:3000/api/seed`

## Entidad de Usuarios

Necesitamos una entidad de usuarios para controlar la creación y actualización de los productos, además de que es indispensable para la autenticación y autorización de los mismos. Vamos a crear un nuevo recurso con el siguiente comando:

```txt
$: nest g res auth --no-spec
? What transport layer do you use? REST API
? Would you like to generate CRUD entry points? Yes
```

Dentro de la entidad de autenticación vamos a realizar el siguiente cambio (también cambiamos el nombre del archivo a `user.entity.ts`):

```ts
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity( 'users' )
export class User {
    @PrimaryGeneratedColumn( 'uuid' )
    id: string

    @Column( 'text', {
        unique: true
    } )
    email: string

    @Column( 'text' )
    password: string

    @Column( 'text' )
    fullName: string

    @Column( 'bool', {
        default: true
    } )
    isActive: boolean

    @Column( {
        type: 'text',
        array: true,
        default: [ 'user' ]
    } )
    roles: string[]
}
```

Ahora, para que TypeORM reconozca esta entidad como una tabla dentro de la base de datos, debemos ir al archivo `auth.module.ts` para realizar la siguiente importación y configuración:

```ts
import { TypeOrmModule } from '@nestjs/typeorm'
import { User } from './entities/user.entity'
...
@Module( {
    imports: [
        TypeOrmModule.forFeature( [
            User
        ] ),
    ],
    ...
} )
export class AuthModule { }
```

Como tenemos activa la función de sincronización, vamos a observar los cambios una vez guardado el proyecto y recargado el gestor la bases de datos. En caso de estar en producción se debe trabajar con migraciones.

## Crear usuario

Para crear un usuario, vamos a definir un nuevo endpoint que reciba un body con una estructura definida por nosotros. Dicha estructura la especificamos en el archivo `create-user.dto.ts`:

```ts
import { IsString, IsEmail, MinLength, MaxLength, Matches } from 'class-validator'

export class CreateUserDTO {
    @IsString()
    @IsEmail()
    email: string

    @IsString()
    @MinLength( 6 )
    @MaxLength( 50 )
    @Matches(
        /(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
        message: 'The password must have a Uppercase, lowercase letter and a number'
    } )
    password: string

    @IsString()
    @MinLength( 1 )
    fullName: string
}
```

Ahora, dentro del controlador definimos el método para el registro del usuario:

```ts
import { Body, Controller, Post } from '@nestjs/common'
import { AuthService } from './auth.service'
import { CreateUserDTO } from './dto/create-user.dto'

@Controller( 'auth' )
export class AuthController {
    constructor ( private readonly authService: AuthService ) { }

    @Post( 'register' )
    register ( @Body() createUserDto: CreateUserDTO ) {
        return this.authService.create( createUserDto )
    }
}
```

Lo siguiente es definir la lógica del servicio, para crear el usuario y retornar la data creada:

```ts
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { CreateUserDTO } from './dto/create-user.dto'
import { User } from './entities/user.entity'
...
@Injectable()
export class AuthService {
    ...
    constructor ( @InjectRepository( User ) private readonly _userRepository: Repository<User> ) { }

    async create ( createUserDto: CreateUserDTO ) {
        try {
            const user = this._userRepository.create( createUserDto )
            await this._userRepository.save( user )
            return user
        } catch ( error ) {
            this._handleDBException( error )
        }
    }
    ...
}
```

Algo que podemos mejorar es el no recrear el método `_handleDBException` en todos los servicios, más bien, podemos crear un servicio dentro del módulo `commons`, exportarlo e importarlo en lo módulos que requieran controlar los errores que se deban a la base de datos. Para esto usaremos el siguiente comando:

```txt
$: nest g s commons/services/db-exception --no-spec --flat
```

Exportamos el servicio:

```ts
import { DBExceptionService } from './services/db-exception.service'
...
@Module( {
    providers: [ DBExceptionService ],
    exports: [ DBExceptionService ]
} )
export class CommonsModule { }
```

Creamos el método dentro del servicio, y como plus vamos a definir que el método nunca retorna nada mediante el tipo `never`, y mediante el modificador de acceso `static` lograremos que no tengamos que importarlo todo el servicio en cada módulo:

```ts
import { BadRequestException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common'
import { PostgreSQLErrorCodes } from '../enums/db-error-codes.enum'

@Injectable()
export class DBExceptionService {
    private static logger = new Logger( 'DBExceptionService' )

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

Ahora usamos el método dentro de los servicios que lo requieran, hasta el momento el módulo de usuarios y de productos:

```ts
import { DBExceptionService } from 'src/commons/services/db-exception.service'
...
@Injectable()
export class AuthService {
    async create ( createUserDto: CreateUserDTO ) {
        try { ... } catch ( error ) {
            DBExceptionService.handleDBException( error )
        }
    }
}
```

## Encriptar la contraseña

Debemos evitar que la contraseña sea retornada en las consultas, y además deben estar encriptadas dentro de la base de datos, usando hash de 1 sola vía para evitar su revelación forzada. Usaremos el paquete `bcrypt` ejecutando los siguiente comandos:

```txt
$: pnpm i -S bcrypt
$: pnpm i -D @types/bcrypt
```

Dentro del servicio llamamos el paquete y usamos el método `hashSync` para encriptar la contraseña al momento de guardar el registro:

```ts
import * as bcrypt from 'bcrypt'
...
@Injectable()
export class AuthService {
    ...
    async create ( createUserDto: CreateUserDTO ) {
        try {
            const { password, ...userData } = createUserDto
            const user = this._userRepository.create( {
                ...userData,
                password: bcrypt.hashSync( password, 10 )
            } )
            await this._userRepository.save( user )
            return user
        } catch ( error ) { ... }
    }
}
```

De esta manera cada que se registre un nuevo usuario, se va a encriptar la contraseña dentro de la base de datos, pero el problema es que se está retornando el hash dentro de la respuesta. Una manera sencilla es usando `delete` sobre el objeto que se va retornar, luego aplicaremos una mejor estrategia:

```ts
@Injectable()
export class AuthService {
    ...
    async create ( createUserDto: CreateUserDTO ) {
        try {
            ...
            await this._userRepository.save( user )
            delete user.password
            return user
        } catch ( error ) { ... }
    }
}
```

## Login de usuario

Es momento de redactar el método del login. Iniciamos definiendo el DTO para el body de la petición (Importante, no lo extendemos como tipo parcial del DTO de registro, por que queremos que todas las propiedades sean requeridas):

```ts
import { IsEmail, IsString, MinLength, MaxLength, Matches } from 'class-validator'

export class LoginUserDTO {
    @IsString()
    @IsEmail()
    email!: string

    @IsString()
    @MinLength( 6 )
    @MaxLength( 50 )
    @Matches(
        /(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
        message: 'The password must have a Uppercase, lowercase letter and a number'
    } )
    password!: string
}
```

Seguimos con la creación del punto de entrada en el controlador:

```ts
import { LoginUserDTO } from './dto/login-user.dto'
...
@Controller( 'auth' )
export class AuthController {
    ...
    @Post( 'login' )
    login ( @Body() loginUserDto: LoginUserDTO ) {
        return this.authService.login( loginUserDto )
    }
}
```

En este punto es importante que tengamos en cuenta el no mostrar la contraseña en cualquier consulta hacía la tabla de usuarios, por lo que para evitar esta falla de seguridad, la vamos a excluir dentro de la configuración de la entidad:

```ts
@Entity( 'users' )
export class User {
    ...
    @Column( {
        type: 'text',
        select: false
    } )
    password: string;
    ...
}
```

Ahora, definimos el servicio, en donde desestructuramos la información que recibe, para luego buscar el usuario mediante su email, pero en este caso si necesitamos el password para hacer la comparación entre la que se ingresa y la existente en el registro. En caso de que no se encuentre el usuario retornamos un status 401, pero si todo sale bien, retornamos el usuario por ahora:

```ts
@Injectable()
export class AuthService {
    ...
    async login ( loginUserDto: LoginUserDTO ) {
        const { email, password } = loginUserDto;

        const user = await this._userRepository.findOne( {
            where: { email },
            select: { email: true, password: true }
        } );

        if ( !user || !bcrypt.compareSync( password, user.password ) )
            throw new UnauthorizedException( 'Invalid credentials' );

        return user;
    }
}
```

## Nest Authentication Passport

Vamos a usar la estrategia de autenticación que nos provee Nest, por lo que haremos una instalación del paquete `passport` y su adaptador en nest, con el siguiente comando:

```txt
$: pnpm i @nestjs/passport passport
```

Cómo también usaremos JWT necesitamos otra instalación:

```txt
$: pnpm i -S @nestjs/jwt passport-jwt
$: pnpm i -D @types/passport-jwt
```

Dentro del decorador de definición del módulo de autenticación, realizamos un registro de la estrategia `jwt` para el passport, y configuramos algunas parte del token que se genere:

```ts
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
...
@Module( {
    imports: [
        ...,
        PassportModule.register( { defaultStrategy: 'jwt' } ),
        JwtModule.register( {
            secret: process.env.JWT_SECRET,
            signOptions: {
                expiresIn: '2h'
            }
        } )
    ],
    ...
} )
export class AuthModule { }
```

El inconveniente que se puede presentar, es que las variables de entorno aún no hayan sido reconocidas al momento de levanter el proyecto, y por lo tanto nuestro registro del módulo JWT sea fallido. En este caso tenemos la opción de hacer el registro asíncrono.

## Módulos Asíncronos

Cuando registramos un módulo de manera asíncrona tenemos la oportunidad de hacer inyecciones dentro del mismo, algo muy útil para nosotros, ya que reemplazaremos el uso de `process.env` por una instancia de `ConfigService`. Mediante la propiedad `useFactory` creamos una función anónima para establecer la configuración que teníamos anteriormente:

```ts
@Module( {
    imports: [
        ...,
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
            },
        } )
    ],
    ...
} )
export class AuthModule { }
```

## JwtStrategy

Cuando recibamos el JWT, debemos identificar el usuario al cual le pertenece. Un JWT consta de un header que define el algoritmo y el tipo de token, el objeto payload que contiene la data principal que guardamos dentro del token, y un verify signature en donde se valida la firma y validez del token.

Vamos a crear un nuevo archivo llamado `auth/strategies/jwt.strategy.ts`, y dentro de este archivo creamos una clase que extiende de `PassportStrategy`. En esta clase creamos un método para validar el payload del JWT, y que retornará un usuario una vez aplicada la validación.

```ts
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-jwt";
import { User } from "../entities/user.entity";
import { IJwtPayload } from "../interfaces/jwt-payload.interface";

export class JwtStrategy extends PassportStrategy( Strategy ) {
    async validate ( payload: IJwtPayload ): Promise<User> {
        const { email } = payload;
        return;
    }
}
```

## JwtStrategy - Parte 2

Vamos a validar que el contenido del payload contenga un email valido, por lo que necesitamos buscar el usuario y para ello inyectamos el servicio de usuarios, lo cual nos obliga a traer las propiedades de la clase padre, por lo que vamos a aprovechar y definir algunas propiedades más, tales como la llave secreta y que el token sea de tipo Bearer Token. En caso de que no se encuentre el usuario por su email, o que se encuentre inactivo, retornamos un status 401:

```ts
import { ExtractJwt, ... } from "passport-jwt";
import { User } from "../entities/user.entity";
import { Repository } from 'typeorm';
import { InjectRepository } from "@nestjs/typeorm";
import { ConfigService } from '@nestjs/config';
...

export class JwtStrategy extends PassportStrategy( Strategy ) {
    constructor (
        @InjectRepository( User ) private readonly _userRepository: Repository<User>,
        _configService: ConfigService
    ) {
        super( {
            secretOrKey: _configService.get( 'JWT_SECRET' ),
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
        } );
    }

    async validate ( payload: IJwtPayload ): Promise<User> {
        const { email } = payload;

        const user = await this._userRepository.findOneBy( { email } );

        if ( !user ) throw new UnauthorizedException( 'Token not valid' );

        if ( !user.isActive ) throw new UnauthorizedException( 'User is inactive, talk with an admin' );

        return user;
    }
}
```

Con el anterior método logramos que la información del usuario ya se encuentre disponible en la Request, y que posteriormente podamos acceder a la misma mediante interceptors y decoradores. Ahora, debemos definir que nuestra clase sea un provider mediante el decorador `@Injectable()`:

```ts
import { Injectable, ... } from '@nestjs/common';
...
@Injectable()
export class JwtStrategy extends PassportStrategy( Strategy ) {...}
```

Luego lo proveemos dentro del módulo de autenticación, y también lo exportaremos por qué puede que se necesite en cualquier otro lugar para validar el token, pero también vamos a exportar la configuración del módulo de passport y JWT:

```ts
import { JwtStrategy } from './strategies/jwt.strategy';
...
@Module( {
    ...,
    providers: [ ..., JwtStrategy ],
    exports: [ ..., JwtStrategy, PassportModule, JwtModule ]
} )
export class AuthModule { }
```

## Generar un JWT

Hay 2 lugares donde debemos retornar el JWT, al momento del registro y al momento del login, por lo que vamos a crear un método privado dentro del servicio de autenticación, el cual usará una inyección del `JwtService` que ya tenemos gracias a la importación del `JwtModule`:

```ts
import { JwtService } from '@nestjs/jwt';
...

@Injectable()
export class AuthService {
    constructor (
        ..., private readonly _jwtService: JwtService
    ) { }

    async create ( createUserDto: CreateUserDTO ) {
        try {
            ...
            return {
                token: this._getJwtToken( { email: user.email } ),
                user
            };
        } catch ( error ) { ... }
    }

    async login ( loginUserDto: LoginUserDTO ) {
        ...
        return {
            token: this._getJwtToken( { email: user.email } ),
            user
        };
    }

    private _getJwtToken ( payload: IJwtPayload ) {
        return this._jwtService.sign( payload );
    }
}
```

Antes de avanzar, vamos a realizar una modificación al campo de correo, puesto que queremos que siempre se guarde en minúsculas:

```ts
import { BeforeInsert, BeforeUpdate, ... } from 'typeorm';

@Entity( 'users' )
export class User {
    ...
    @BeforeInsert()
    @BeforeUpdate()
    checkFieldsBeforeInsertOrUpdate () {
        this.email = this.email.toLowerCase().trim();
    }
}
```

## Private Route - General

Mediante los Guards logramos permitir o prevenir el acceso a una ruta, aquí es donde se debe autorizar una solicitud. Para usar un guard usamos el decorador `@UseGuards()`, ya sea a nivel de método, controlador o módulo, pero en este caso lo haremos a nivel del endpoint, y usamos el Guard de autenticación definido por el propio paquete de `@nest/passport`:

```ts
import { ..., UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
...
@Controller( 'auth' )
export class AuthController {
    ...
    @Get( 'private-testing' )
    @UseGuards( AuthGuard() )
    testingPrivateRoute () {
        return {
            ok: true,
            message: 'Ruta privada'
        };
    }
}
```

Cuando hacemos la request, debemos añadir dentro de los headers la propiedad `Authorization` con el valor de `Bearer <token>`, para que nuestro servidor de acceso a la función del endpoint, por que de caso contrario tendremos un error 401. Este Guard hace uso de manera implícita de la función de validación que definimos en la estrategia.

## Cambiar email por id en el Payload

Hay un pequeño problema con el payload del token, puesto que estamos usando el email que contiene para realizar la consulta dentro de la base de datos y validar el token, pero cuando cambiamos el correo electrónico, nuestro token será invalido. Para controlar esto debemos actualizar la interfaz del payload:

```ts
export interface IJwtPayload {
    id: string;
}
```

Luego actualizamos el método de validación para extraer el id en reemplazo del email:

```ts
@Injectable()
export class JwtStrategy extends PassportStrategy( Strategy ) {
    ...
    async validate ( payload: IJwtPayload ): Promise<User> {
        const { id } = payload;
        const user = await this._userRepository.findOneBy( { id } );
        ...
    }
}
```

Por último, vamos a los métodos de registro y login en el servicio, para actualizar la información que guarda el payload, pero en el caso del login, necesitamos añadir la propiedad `id` dentro de la consulta `select`:

```ts

@Injectable()
export class AuthService {
    ...
    async create ( createUserDto: CreateUserDTO ) {
        try {
            ...
            return {
                token: this._getJwtToken( { id: user.id } ),
                user
            };
        } catch ( error ) { ... }
    }

    async login ( loginUserDto: LoginUserDTO ) {
        ...
        const user = await this._userRepository.findOne( {
            where: { email, },
            select: { id: true, email: true, password: true }
        } );
        ...
        return {
            token: this._getJwtToken( { id: user.id } ),
            user
        };
    }
    ...
}
```
