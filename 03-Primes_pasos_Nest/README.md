# Sección 03: Primeros pasos en Nest

Estamos entrando a nuestra primera sección sobre Nest, aquí veremos:

- ¿Qué es Nest?
- ¿Por qué usarlo?
- Explicación sobre cada archivo en un proyecto nuevo de Nest
- Core Nest building blocks
  - Módulos
  - Controladores (Post, Patch, Get, Delete)
  - Primeros decoradores
  - Servicios
  - Inyección de dependencias
  - Pipes
  - Exception Filters

Adicionalmente estaremos creando un Rest Api inicial para ir explicando cada concepto paso a paso.

## ¿Qué es Nest? ¿Por qué usarlo?

Nest es un marco de trabajo dogmático (opinionated), en el cual se sigue una determinada nomenclatura, file system, etc. Su forma estructurada nos permite mantener una aplicación más ordenada y file de soportar. Nest permite crear aplicaciones del lado del servidor con NodeJS y TypeScript. Nest está fuertemente inspirado en Angular, pero no es necesario saber de uno para aprender sobre el otro.

## Instalar Nest CLI (Command Line Interface)

Para instalar Nest CLI podemos usar el siguiente comando:

```txt
$: pnpm i -g @nestjs/cli
```

Verificamos la versión de Nest con el comando:

```txt
$: nest --version
```

O en su versión más corta:

```txt
$: nest -v
```

## Generar nuestro primer proyecto - CarDealership

Vamos a crear nuestro primer proyecto en Nest, para lo cual usamos el siguiente comando:

```txt
$: nest new car-dealership
```

Seleccionamos el manejador de paquetes preferido (en mi caso pnpm), es esperamos el progreso de la instalación. Una vez se termine de crear el proyecto, nos dirigimos al directorio del mismo y lo levantamos en modo desarrollo con el comando:

```txt
$: pnpm start:dev
```

Por defecto Nest trabaja en el puerto 3000, por lo que podemos ir a `http://localhost:3000` y tener un mensaje de `Hello World!`. Cuando vayamos a modificar el código, si tenemos un formatter code diferente a Prettier, y no queremos que se generen conflictos con el linter por el formato, podemos personalizar las reglas del archivo `.prettierrc` o dentro del archivo `.eslintrc.js` eliminar la linea asociada con el formatter:

```js
module.exports = {
    ...,
    extends: [
        'plugin:@typescript-eslint/recommended',
        // 'plugin:prettier/recommended',
    ],
    ...,
};
```

## Explicación de cada archivo y directorio

- `.eslintrc.js`: Archivo de configuración de linter para aplicación de buenas prácticas recomendadas por los creadores de Nest, procurando seguir ciertos standards
- `.gitignore`: Archivo que nos permite ignorar ciertos archivos y directorios que no deben tener seguimiento en el repositorio.
- `.prettierrc`: Archivo de configuración del formatter code Prettier
- `nest-cli.json`: Configuraciones del CLI
- `package.json`: Configuraciones generales del proyecto, tales como nombre, versión, scripts, dependencias de producción y de desarrollo, y la configuración de jest.
- `tsconfig.build.json`: Archivo con las configuraciones de TypeScript para el build de producción
- `tsconfig.json`: Establece las reglas con las que TypeScript se debe regir
- `dist/`: Almacena el producto final para la ejecución en desarrollo, o en producción.
- `node_modules/`: Almacén de los paquetes necesarios para el proyecto
- `test/`: Conserva los archivos dedicados al testing.

## Módulos

Dentro del directorio `src/` tenemos múltiples archivos, pero los vamos a borrar por que vamos a crearlos desde ceros, excepto el `app.module.ts` al cual vamos a dejar de la siguiente manera:

```ts
import { Module } from '@nestjs/common'


@Module( {
    imports: [],
    controllers: [],
    providers: [],
    exports: []
} )
export class AppModule { }
```

Los módulos hacen parte de los ***Build Blocks***, y se encarga de agrupar y desacoplar un conjunto de funcionalidades específicas por dominio. En este caso `AppModule` es el módulo principal o root de la aplicación.

El archivo `main.ts` tiene el punto de acceso principal de la aplicación, y en cual se crea el proyecto haciendo uso del módulo principal:

```ts
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'


async function bootstrap () {
    const app = await NestFactory.create( AppModule )
    await app.listen( 3000 )
}
bootstrap()
```

Como eliminamos el controlador y los servicios, los cuales se encargaban de la petición y respuesta a un endpoint, cuando levantemos la aplicación, vamos a tener un mensaje como el siguiente en el navegador:

```json
{
    "statusCode": 404,
    "message": "Cannot GET /",
    "error": "Not Found"
}
```

Normalmente hacemos las peticiones o pruebas de las mismas a través de un API Client como por ejemplo Postman, Thunder o RapidClient.
