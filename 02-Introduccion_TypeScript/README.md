# Sección 02: Breve introducción a TypeScript y conocimientos generales básicos

Esta sección tiene por objetivo dar unas bases sobre TypeScript con la idea de familiarizarnos con los conceptos comunes usados en el día a día con Nest.

Aquí veremos:

- Tipos básicos
- Interfaces
- Implementaciones
- Clases
- Patrón adaptador
- Principio de sustitución de Liskov
- Inyección de dependencias
- Getters
- Métodos asíncronos
- Decoradores de clases y métodos

Es importante recalcar que esto no es una introducción a TypeScript, son conceptos que necesitamos conocer porque los usaremos en el curso de Nest.

## Preparación del proyecto

NestJS trabaja principalmente con TypeScript, por lo que está sección es importante para entender muchos elementos de lo que vamos a trabajar. Vamos a usar Vite, por lo que dentro del directorio anexo usaremos el siguiente comando:

```txt
$: pnpm create vite
```

Asignamos el nombre del proyecto, seleccionamos que el framework sea Vanilla y que la variante sea TypeScript. Con lo anterior listo, procedemos a la instalación de las dependencias con el comando:

```txt
$: pnpm install
```

Una vez reconstruido los paquetes de node vamos a levantarlo con el comando:

```txt
$: pnpm dev
```

Con el proyecto corriendo podemos ir a la dirección `http://localhost:5173/` y observar el mensaje de bienvenida. Es importante que abramos la consola en las herramientas de desarrollador para observar los outputs que vamos a provocar.
