# Sección 07: MongoDB Pokedex

Esta sección enteramente se enfoca en la grabación a base de datos, pero puntualmente:

- Validaciones
- CRUD contra base de datos
- Docker y Docker Compose
- Conectar contenedor con filesystem (para mantener la data de la base de datos)
- Schemas
- Modelos
- DTOs y sus extensiones
- Respaldar a Github

## Inicio del proyecto - Pokedex

Vamos a crear un nuevo proyecto para esta sección, para ello usamos el siguiente comando, en mi caso usaré como gestor de paquetes a pnpm:

```txt
$: nest new pokedex
```

Inicialmente, dentro de la carpeta `src` vamos dejar solo el archivo de `app.module.ts` y `main.ts`, y desactivaremos el linter dentro del archivo `.eslintrc.js`:

```js
module.exports = {
    ...
    extends: [
        'plugin:@typescript-eslint/recommended',
        // 'plugin:prettier/recommended',
    ],
    ...
};
```

Recordar que para levantar el proyecto en modo desarrollo usamos el comando `pnpm start:dev`
