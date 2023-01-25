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

## Objetos e Interfaces

Vamos a crear un nuevo archivo llamado `02-objects.ts` en que definimos un arreglo de tipo numérico, el cual será inferido por TS:

```ts
export const pokemonIds = [ 1, 2, 3, 4, 5 ]
```

Si intentamos agregar un string al arreglo, el linter nos dirá que es un error, pero TypeScript usará sin problema el arreglo, y esto se debe a la transpilación de TS a JS, en donde tal error está permitido

```ts
pokemonIds.push('10')   // No se puede asignar un argumento de tipo "string" al parámetro de tipo "number"

console.log(pokemonIds)     // [ 1, 2, 3, 4, 5, '10' ]
```

La importancia de los tipos en TypeScript y el linter, es que mantenemos un código más ordena y con menos posibilidades de fallas. Si insistimos en guardar un string dentro del arreglo, debemos castearlo al tipo adecuado, por ejemplo:

```ts
pokemonIds.push(+'10')   
pokemonIds.push(Number('11'))   

console.log(pokemonIds)     // [ 1, 2, 3, 4, 5, 10, 11 ]
```

Con los objetos pasa algo interesante, y es que si no definimos el tipo de estructura, podemos añadir o remover sus keys sin ningún error, llegando a generar errores futuros en el código. Para evitar esto, se definen las interfaces:

```ts
export interface IPokemon {
    id: number
    name: string
}

export const saurio: IPokemon = {
    id: 1,
    name: "saurio"
}
```

Si intentamos asignar un valor de tipo incorrecto, añadir o remover una propiedad, tendremos un error. Si queremos algo opcional podemos hacer lo siguiente:

```ts
export interface IPokemon {
    ...
    age?: number
}

export const saurio: IPokemon = {
    id: 1,
    name: "saurio"
}

export const charmander: IPokemon = {
    id: 2,
    name: 'charmander',
    age: 10
}
```

Algunos programadores definen el tipo de la propiedad de la siguiente manera:

```ts
export interface IPokemon {
    ...
    age: number | undefined
}
```

En cuyo caso el valor de la propiedad puede ser un número o valor indefinido, pero no puede faltar la declaración de la propiedad, por ejemplo para el caso de mi pokemon saurio, el cual no tiene edad, con el anterior tipo de declaración debería verse de la siguiente manera:

```ts
export const saurio: IPokemon = {
    id: 2,
    name: 'saurio',
    age: undefined
}
```
