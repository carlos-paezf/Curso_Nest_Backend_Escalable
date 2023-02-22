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
