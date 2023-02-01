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

## Servir contenido estático

Podemos servir contenido estático con un proyecto frontend de nuestra preferencia, y se suele guardar dentro del directorio `public` en la raíz del proyecto. Por ejemplo tenemos un archivo `index.html` con el siguiente contenido:

```html
<!DOCTYPE html>
<html lang="en">

    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="./css/style.css">
        <title>Pokedex</title>
    </head>

    <body>
        <h1>Contenido estático de la aplicación</h1>
    </body>

</html>
```

Y un archivo `css/style.css` con los siguientes estilos:

```css
html,
body {
    padding: 20px;
    background-color: gray;
}

h1 {
    font-size: 20px;
    color: white;
}
```

Ahora, para servir contenido estático dentro de la aplicación, necesitamos instalar un paquete con el siguiente comando:

```txt
$: pnpm install @nestjs/serve-static
```

Dentro del archivo `app.module.ts` añadimos la siguiente configuración:

```ts
import { Module } from '@nestjs/common'
import { ServeStaticModule } from '@nestjs/serve-static'
import { join } from 'path'

@Module( {
    imports: [
        ServeStaticModule.forRoot( {
            rootPath: join( __dirname, '..', 'public' )
        } )
    ]
} )
export class AppModule { }
```

Con ello, al momento de ir al endpoint `http://localhost:3000` tendremos una página web personalizada como contenido estático.
