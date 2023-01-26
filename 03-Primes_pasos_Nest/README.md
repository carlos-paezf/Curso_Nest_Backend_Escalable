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
