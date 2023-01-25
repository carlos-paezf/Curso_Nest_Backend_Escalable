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

## Tipos y bases sobre módulos

Vamos a crear un directorio dentro de `src`, y dentro del cual añadimos el archivo `bases/01-types.ts`. Ya que tenemos el linter activado por defecto, si no tenemos nada en el archivo, nos mostrará un error, para solucionarlos debemos importar o exportar algo.

TypeScript infiere los tipos de las variables que creamos con un valor, pero si queremos ser más explícitos, declaramos el tipo de la siguiente manera:

```ts
export const name: string = "Ferrer"
```

Podemos usar nuestra variable dentro del archivo `main.ts` de la siguiente manera: Importamos el elemento de su archivo y luego lo incluimos en template string que se mostrará en la página.

```ts
import { name } from './bases/01-types'

document.querySelector<HTMLDivElement>( '#app' )!.innerHTML = `
    <div>
        <h1>Hello ${ name }</h1>
    </div>
`
```

Cuando tenemos un archivo en el que estamos exportando una variable, función o instancia, ya se puede considerar un módulo. Siempre es importante evitar escribir código como uso de funciones o por el estilo, puesto que esto hace que se tenga que ejecutar todo el archivo por un solo uso. Es preferible que los módulos solo sean usados para exportar declaraciones.

## Tipos de datos - Continuación

En TS tenemos Type Safety, lo cual nos permite que una vez declarado el tipo de la variable, solo se puede usar un valor del mismo tipo:

```ts
const name: string = 'Ferrer'  // ✅
const age: number = '22'       // ❌
```

Es importante recordar que tenemos los keywords `var`, `let` y `const`, teniendo en cuenta que el primero no es recomendado, el segundo nos permite cambiar el valor de la variable dentro del scope en que se creo, y el tercero mantiene un valor inmutable dentro de su scope.

Así como podemos dejar que TS infiera el tipo, o podemos declarar el tipo de la valor, tenemos la posibilidad de definir múltiples opciones de tipo para el valor:

```ts
const variable: string | number | boolean | undefined | null | [] | {} = `valor` 
```

En los strings tenemos la opción de usar `""`, `''` o <code>``</code> para encerrar el valor del string. La diferencia radica en que por medio de la tercera forma, conocida como template string, podemos interpolar un valor mediante el uso de <code>${}</code>, como lo vimos en el ejemplo de la [lección anterior](README.md#tipos-y-bases-sobre-módulos)
