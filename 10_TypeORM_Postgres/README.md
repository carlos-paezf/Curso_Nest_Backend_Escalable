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

    @Column( 'numeric', {
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
