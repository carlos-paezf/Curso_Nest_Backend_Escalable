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
