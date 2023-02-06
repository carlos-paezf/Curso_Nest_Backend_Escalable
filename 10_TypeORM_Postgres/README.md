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
