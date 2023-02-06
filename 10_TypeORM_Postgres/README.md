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
