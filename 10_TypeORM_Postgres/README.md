# Sección 10: TypeORM - Postgres

En esta sección estaremos trabajando con:

- TypeORM
- Postgres
- CRUD
- Constrains
- Validaciones
- Búsquedas
- Paginaciones
- DTOs
- Entities
- Decoradores de TypeORM para entidades
- Métodos BeforeInsert, BeforeUpdate

Es una sección importante porque a partir de aquí, empezaremos a construir sobre ella relaciones, autenticación, autorización y websockets.

## Inicio del proyecto - TesloShop

Vamos a crear un nuevo proyecto que estaremos usando en las siguientes secciones. Para la creación del proyecto usamos el siguiente comando:

```txt
$: nest new teslo-shop
```

Para levantar el proyecto en modo desarrollo usamos el siguiente comando:

```txt
$: pnpm start:dev
```

Inicialmente dejamos dentro del directorio `src/` solo los archivos `app.module.ts` y `main.ts`, y desactivamos el linter de prettier dentro del archivo `.eslintrc.js`:

```js
module.exports = {
    ...,
    extends: [
        'plugin:@typescript-eslint/recommended',
        // 'plugin:prettier/recommended',
    ],
    ...
};
```

## Docker - Instalar y correr Postgres

Podemos hacer la instalación de Postgres en nuestro equipo, pero nos conviene más mantener una imagen en Docker de Postgres, con el objetivo de tener una misma configuración con todo el equipo de desarrollo.

Lo primero será declarar las variables de entorno iniciales en el archivo `.env`:

```env
DB_PASSWORD = "53CR3T_P455W0RD"
DB_NAME = "TesloDB"
DB_PORT = 5433
```

Creamos el archivo `docker-compose.yaml` en donde tendremos la configuración del servicio de la base de datos. Como tenemos listo el archivo `.env`, podemos hacer uso de sus variables:

```yaml
version: '3'

services:
    db:
        image: postgres:14.3
        restart: always
        ports:
            - "${DB_PORT}:5432"
        environment:
            POSTGRES_PASSWORD: ${DB_PASSWORD}
            POSTGRES_DB: ${DB_NAME}
        container_name: teslo-db
        volumes:
            - ./postgres:/var/lib/postgresql/data
```

Levantamos el archivo en modo detach con el siguiente comando:

```txt
$: docker-compose up -d
```

Podemos usar cualquier programa para visualizar bases de datos, en este caso vamos a usar Table Plus, pero también podríamos usar la imagen de PgAdmin para tener un contenedor que se encargue de dicha funcionalidad.

En caso de que necesitemos bajar el docker-compose y remover todo lo creado por el mismo, usamos el siguiente comando:

```txt
$: docker-compose down
```

## Conectar Postgres con Nest

Vamos a conectar nuestra aplicación de Nest con Postgres, y esto lo haremos con TypeORM, el cual sirve para bases de datos relacionales.

Antes de realizar la conexión, vamos a configurar las variables de entorno. Primero instalamos el módulo de configuración:

```txt
$: pnpm i @nestjs/config
```

Luego, dentro del archivo `app.module.ts` hacemos la siguiente configuración:

```ts
import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'

@Module( {
    imports: [ ConfigModule.forRoot() ],
} )
export class AppModule { }
```

También vamos a implementar el esquema de variables con Joi, por lo que hacemos la instalación del mismo con el comando a continuación:

```txt
$: pnpm i joi
```

Creamos el archivo `config/joi.validation.ts` en donde establecemos las siguientes reglas para las variables que tenemos actualmente:

```ts
import * as Joi from 'joi'

export const JoiValidationSchema = Joi.object( {
    DB_HOST: Joi.required().default( 'localhost' ),
    DB_PORT: Joi.number().default( 5433 ),
    DB_USER: Joi.required().default( 'postgres' ),
    DB_PASSWORD: Joi.required(),
    DB_NAME: Joi.required()
} )
```

Cargamos el esquema dentro de la configuración global de la aplicación:

```ts
import { JoiValidationSchema } from './config/joi.validation'
...

@Module( {
    imports: [ ConfigModule.forRoot( {
        validationSchema: JoiValidationSchema
    } ) ],
} )
export class AppModule { }
```

Para la conexión con la base de datos necesitamos instalar el paquete de TypeORM, el adaptador que ofrece Nest, y el driver de la base de datos, por lo tanto, usamos el siguiente comando:

```txt
$: pnpm i @nestjs/typeorm typeorm pg
```

Ahora, dentro del archivo `app.module.ts` configuramos TypeORM, pero en este caso usaremos las variables mediante el `process.env` ya que no tenemos inyectado el `ConfigService` en este nivel:

```ts
import { TypeOrmModule } from '@nestjs/typeorm'
...

@Module( {
    imports: [
        ...,
        TypeOrmModule.forRoot( {
            type: 'postgres',
            host: process.env.DB_HOST,
            port: Number( process.env.DB_PORT ),
            database: process.env.DB_NAME,
            username: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            autoLoadEntities: true,
            synchronize: true
        } )
    ],
} )
export class AppModule { }
```

La propiedad `synchronize` es útil en modo desarrollo, ya que a medida que avanzamos en el proyecto, la base de datos recibe los cambios correspondientes a las tablas y demás con ayuda de la propiedad `autoLoadEntities`. Pero, cuando estamos en la fase de producción, es preferible dejar la variable en `false` y trabajar todo mediante migraciones.

## TypeORM - Entity - Product

Vamos a crear un resource para los productos con el siguiente comando:

```txt
$: nest g res products --no-spec
```

Un entity es una representación de una tabla en la base de datos, para el caso de TypeORM debemos usar el decorador `@Entity` para que sea reconocido como entidad dentro de la base de datos. Vamos a definir la entidad de productos, un id auto-generado de tipo uuid, y una columna de titulo único en la base de datos:

```ts
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm"


@Entity()
export class Product {
    @PrimaryGeneratedColumn( 'uuid' )
    id: string

    @Column( 'text', {
        unique: true
    } )
    title: string
}
```

Para que TypeORM reconozca la entidad de manera automática, y por lo tanto cree un tabla para la misma dentro de la base de datos (recordando que en la configuración inicial dejamos en `true` la propiedad `synchronize`), debemos importar `TypeOrmModule` dentro del módulo de productos, y definir un arreglo con las entidades que se definan dentro del mismo:

```ts
import { TypeOrmModule } from '@nestjs/typeorm'
import { Product } from './entities/product.entity'
...

@Module( {
    ...,
    imports: [
        TypeOrmModule.forFeature( [
            Product
        ] )
    ]
} )
export class ProductsModule { }
```

Al momento que se recarga la aplicación para reconocer los cambios, podremos observar que en la base de datos se definieron algunas funciones para las llaves uuid, pero lo más relevante en este momento, es que tenemos la tabla de productos. Si actualizamos las propiedades de la entidad, entonces la base de datos reconocerá el cambio de manera inmediata.

## Entidad sin relaciones

Vamos a terminar de manera parcial la entidad, puesto que aún no vamos a crear las relaciones con otras entidades:

```ts
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm"


@Entity()
export class Product {
    @PrimaryGeneratedColumn( 'uuid' )
    id: string

    @Column( 'text', {
        unique: true
    } )
    title: string

    @Column( 'float', {
        default: 0
    } )
    price: number

    @Column( {
        type: 'text',
        nullable: true
    } )
    description: string

    @Column( 'text', {
        unique: true
    } )
    slug: string

    @Column( 'int', {
        default: 0
    } )
    stock: number

    @Column( 'text', {
        array: true
    } )
    sizes: string[]

    @Column( 'text' )
    gender: string
}
```

## Create Product DTO

Vamos a configurar el global prefix en `main.ts`:

```ts
async function bootstrap () {
    ...
    app.setGlobalPrefix( 'api' )
    ...
}
```

Para la validación de los datos vamos a usar los 2 paquetes de secciones anteriores, para lo cual usamos el siguiente comando:

```txt
$: pnpm i class-validator class-transformer
```

Vamos a establecer de manera global que se use el pipe de validación para tener una lista blanca para cada entidad y prohibir los elementos que no se encuentren en ella:

```ts
async function bootstrap () {
    ...
    app.useGlobalPipes(
        new ValidationPipe( {
            whitelist: true,
            forbidNonWhitelisted: true
        } )
    )
    ...
}
```

Luego, vamos a modificar el archivo `create-product.dto.ts`:

```ts
import { IsArray, IsIn, IsInt, IsNumber, IsOptional, IsPositive, IsString, MinLength } from 'class-validator'

export class CreateProductDto {
    @IsString()
    @MinLength( 1 )
    title: string

    @IsOptional()
    @IsNumber()
    @IsPositive()
    price?: number

    @IsOptional()
    @IsString()
    description?: string

    @IsOptional()
    @IsString()
    slug?: string

    @IsOptional()
    @IsInt()
    @IsPositive()
    stock?: number

    @IsString( { each: true } )
    @IsArray()
    sizes: string[]

    @IsIn( [ 'men', 'women', 'kid', 'unisex' ] )
    gender: string
}
```

## Insertar usando TypeORM

Nuestros controladores siempre deben tener la menor cantidad de lógica, por lo tanto la interacción con la entidad se debe realizar en el servicio. Vamos a implementar el patrón repositorio para realizar las consultas a la base de datos. Anteriormente se tenía que crear una clase manualmente que se encargara de la creación del repositorio, pero actualmente Nest nos permite inyectar un repositorio de manera sencilla:

```ts
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Product } from './entities/product.entity'
...

@Injectable()
export class ProductsService {
    constructor ( @InjectRepository( Product ) private readonly _productRepository: Repository<Product> ) { }
    ...
}
```

Ahora procedemos a definir el servicio de creación. Dentro de una sentencia `try...catch` lanzamos una excepción en caso de que ocurra en error, pero si todo va bien, creamos una instancia de la entidad y luego impactamos la base de datos con dicha instancia, y retornamos la instancia creada:

```ts
@Injectable()
export class ProductsService {
    ...
    async create ( createProductDto: CreateProductDto ) {
        try {
            const product = this._productRepository.create( createProductDto )
            await this._productRepository.save( product )
            return product
        } catch ( error ) {
            console.error( error )
            throw new InternalServerErrorException()
        }
    }
    ...
}
```

Para mejorar un poco las impresiones en consola, vamos a usar el paquete `colors`, para lo cual hacemos la instalación del mismo con el siguiente comando:

```txt
$: pnpm i colors
```

En el caso del método anterior usaríamos colors de la siguiente manera:

```ts
import { red } from 'colors'
...

@Injectable()
export class ProductsService {
    ...
    async create ( createProductDto: CreateProductDto ) {
        try { ... } catch ( error ) {
            console.error( red("Error in ProductsService:create = "), error )
            throw new InternalServerErrorException()
        }
    }
    ...
}
```

Ahora podemos realizar una petición POST al endpoint `http://localhost:3000/api/products` con el siguiente Body, y obtendremos un status 201 con la información del producto creado:

Body:

```json
{
    "title": "New Product",
    "slug": "new_product",
    "sizes": [
        "SM",
        "M",
        "L"
    ],
    "gender": "men",
    "price": 123.4
}
```

Response:

```json
{
    "title": "New Product",
    "slug": "new_product",
    "sizes": [
        "SM",
        "M",
        "L"
    ],
    "gender": "men",
    "description": null,
    "id": "b7f1c8b3-3c51-4466-a0d4-ac61e28c0109",
    "price": 123.4,
    "stock": 0
}
```

Actualmente si intentamos enviar un valor nulo en un campo obligatorio, o un valor duplicado en un indice único, se va a generar un error en la base de datos, y nosotros recibiremos un status 500, por lo que más adelante evitaremos esto tratando los errores.

## Manejo de errores

Para tratar los errores que nos lanza la base de datos, podríamos generar consultas que se encarguen de evaluar los casos de error, pero sería atacar de manera insistente la base de datos.

Lo primero que haremos es crear un logger más elegante para nuestros errores, para ello creamos una instancia de Logger, indicándole que el contexto sea el servicio de productos:

```ts
import { ..., Logger } from '@nestjs/common'
...
@Injectable()
export class ProductsService {
    private readonly _logger = new Logger( 'ProductsService' )
    ...
}
```

Ahora, podemos reemplazar el `console.error` por el uso de la instancia de logger para mostrar el error:

```ts
@Injectable()
export class ProductsService {
    private readonly _logger = new Logger( 'ProductsService' )
    ...
    async create ( createProductDto: CreateProductDto ) {
        try { ... } catch ( error ) {
            this._logger.error( error )
            throw new InternalServerErrorException()
        }
    }
    ...
}
```

Teniendo el logger, podemos desinstalar el paquete de colors y seguir manejando el logger, con el cual tendremos una impresión más elegante.

Podemos controlar aún más los errores al identificar el código de los mismos, y para ello tenemos el listado de [PostgreSQL Error Codes](https://www.postgresql.org/docs/current/errcodes-appendix.html):

```ts
@Injectable()
export class ProductsService {
    ...
    async create ( createProductDto: CreateProductDto ) {
        try { ... } catch ( error ) {
            if ( error.code === '23505' )
                throw new BadRequestException( error.detail )

            if ( error.code === '23502' )
                throw new BadRequestException( error.detail )

            this._logger.error( error )
            throw new InternalServerErrorException( "Unexpected error, check server logs" )
        }
    }
```

Algo que debemos tener en cuenta es que este código se puede usar en diversas partes, por lo que para aplicar el principio DRY vamos a crear un método que se encargue del control de errores:

```ts
@Injectable()
export class ProductsService {
    ...
    async create ( createProductDto: CreateProductDto ) {
        try { ... } catch ( error ) {
            this._handleDBException( error )
        }
    }
    ...
    private _handleDBException ( error: any ) {
        if ( error.code === '23505' )
            throw new BadRequestException( error.detail )

        if ( error.code === '23502' )
            throw new BadRequestException( error.detail )

        this._logger.error( error )
        throw new InternalServerErrorException( "Unexpected error, check server logs" )
    }
}
```

Para no tener "códigos mágicos" y poder identificar el error que estamos tratando de controlar, podemos crear un enum en donde asignamos un nombre más claro a cada error, y este archivo lo podemos guardar en el módulo commons, el cual creamos con el comando:

```txt
$: nest g mo commons
```

El enum tendría la siguiente forma:

```ts
export enum PostgreSQLErrorCodes {
    NOT_NULL_VIOLATION = '23502',
    UNIQUE_VIOLATION = '23505'
}
```

La implementación en nuestro último método de arriba sería la siguiente:

```ts
import { PostgreSQLErrorCodes } from '../commons/enums/db-error-codes.enum'
...
@Injectable()
export class ProductsService {
    ...
    private _handleDBException ( error: any ) {
        if ( error.code === PostgreSQLErrorCodes.NOT_NULL_VIOLATION )
            throw new BadRequestException( error.detail )

        if ( error.code === PostgreSQLErrorCodes.UNIQUE_VIOLATION )
            throw new BadRequestException( error.detail )

        this._logger.error( error )
        throw new InternalServerErrorException( "Unexpected error, check server logs" )
    }
}
```

## BeforeInsert y BeforeUpdate

Cuando intentamos crear un producto sin la propiedad `slug` obtenemos un error ya que es obligatoria en la base de datos, pero queremos que esta propiedad sea autogenerada con base en el titulo, y esto debe pasar al momento de crear o actualizar un registro.

Una opción es hacer este procedimiento antes de crear la instancia en el método de creación o actualización del servicio:

```ts
@Injectable()
export class ProductsService {
    ...
    async create ( createProductDto: CreateProductDto ) {
        try {
            if ( !createProductDto.slug ) 
                createProductDto.slug = createProductDto.title

            createProductDto.slug = createProductDto.slug
                .toLowerCase()
                .replaceAll( " ", "_" )
                .replaceAll( "'", '' )
            
            const product = this._productRepository.create( createProductDto )
            await this._productRepository.save( product )
            return product
        } catch ( error ) {
            this._handleDBException( error )
        }
    }
    ...
}
```

En caso de que la función `replaceAll()` no sea reconocida y aparezca este error `No existe la propiedad "replaceAll" en el tipo "string". ¿Necesita cambiar la biblioteca de destino? Pruebe a cambiar la opción del compilador "lib" a "es2021" o posterior.`, debemos ir al archivo `tsconfig.json` y modificar lo siguiente:

```json
{
    "compilerOptions": {
        ...,
        "target": "es2021",
        ...
    }
}
```

Lo anterior funciona bien, pero lo podemos hacer mejor al crear un procedimiento que se encargue de dicha funcionalidad antes de realizar la inserción en la base de datos. Para ello vamos a la entidad de productos y usamos el decorador `@BeforeInsert()`:

```ts
import { BeforeInsert, ... } from "typeorm"

@Entity()
export class Product {
    ...
    @BeforeInsert()
    checkSlugInsert () {
        if ( !this.slug )
            this.slug = this.title

        this.slug = this.slug
            .toLowerCase()
            .replaceAll( " ", "_" )
            .replaceAll( "'", '' )
    }
}
```

Si intentamos realizar la inserción de un nuevo registro, si enviamos el slug, lo va a normalizar como lo necesitamos, pero si no le enviamos esa propiedad, usará el titulo para crear el slug, y todo esto si tocar el servicio.
