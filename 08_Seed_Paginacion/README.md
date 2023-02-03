# Sección 08: Seed y Paginación

Esta sección tiene por objetivo aprender:

- Uso de modelos en diferentes módulos
- SEED para llenar la base de datos
- Paginación de resultados
- DTOs para Query parameters
- Transformaciones de DTOs

También se mostrará varias formas de hacer inserciones por lote y como lograrlo.

## Continuación del proyecto

Vamos a seguir usando el proyecto de la sección anterior, por lo que podemos usar el siguiente comando para copiarlo:

```txt
$: cp -r 07_MongoDB_Pokedex/pokedex 08_Seed_Paginacion/ 
```

Hacemos la instalación de los `node_modules` con el siguiente comando:

```txt
$: pnpm install
```

Levantamos la base de datos con el comando:

```txt
$: docker-compose up -d
```

Y levantamos el proyecto con el siguiente comando:

```txt
$: pnpm start:dev
```

## Crear módulo SEED

Vamos a crear un módulo SEED que se encargue de llenar con registros la base de datos, de manera que luego podamos hacer la paginación y probarla de manera correcta. Lo primero será crear el módulo mediante un resource con el siguiente comando:

```txt
$: nest g res seed --no-spec
```

Lo siguiente será eliminar los DTOs puesto que no queremos validar nada de la petición, también eliminamos el Entity puesto que no queremos tener una colección Seed en la base de datos. Dentro del controlador solo dejamos el primer método GET sobre el que vamos a trabajar.

```ts
import { Controller, Get } from '@nestjs/common'
import { SeedService } from './seed.service'

@Controller( 'seed' )
export class SeedController {
    constructor ( private readonly seedService: SeedService ) { }

    @Get()
    executeSeed () {
        return this.seedService.populateDB()
    }
}
```

Igualmente, dentro del servicio solo vamos a dejar inicialmente un método que no retorna nada:

```ts
import { Injectable } from '@nestjs/common'

@Injectable()
export class SeedService {
    populateDB () {
        return
    }
}
```

La manipulación de la data será llevada a cabo por los servicios, por lo tanto no vamos a tocar mucho el controlador en las siguientes acciones.

## Realizar petición HTTP desde Nest

Vamos a realizar una petición HTTP a `https://pokeapi.co/api/v2/pokemon` con el fin de obtener los pokemons e insertarlos en nuestra base de datos. Lo primero será instalar Axios con el siguiente comando:

```txt
$: pnpm i @nestjs/axios axios
```

Dentro del servicio vamos a crear una instancia visible de axios (no es una dependencia), con el fin de realizar la petición al endpoint antes mencionado y obtener la data retornada por el mismo:

```ts
import { Injectable } from '@nestjs/common'
import axios, { AxiosInstance } from 'axios'

@Injectable()
export class SeedService {
    private readonly _axios: AxiosInstance = axios

    async populateDB () {
        const { data } = await this._axios.get( `https://pokeapi.co/api/v2/pokemon?limit=2000` )
        return data
    }
}
```

Lo siguiente es generar el tipado de la respuesta para apoyarnos al momento del desarrollo y validación de la data. Podemos usar la extensión Paste JSON as Code y simplificar el trabajo. Las interfaces para la respuesta del servicio del seed de van a encontrar en el archivo `interfaces/poke-res.interface.ts`:

```ts
export interface IPokeResponse {
    count: number
    next: string
    previous: string,
    results: ISmallPokemon[]
}

export interface ISmallPokemon {
    name: string
    url: string
}
```

Dentro del servicio vamos limpiar la data de cada pokemon, para obtener solo el nombre, y el id que tiene asignado dentro de la propiedad url al cual llamamos `number` en nuestra colección:

```ts
@Injectable()
export class SeedService {
    private readonly _axios: AxiosInstance = axios

    async populateDB () {
        const { data: { results } } = await this._axios.get<IPokeResponse>( `https://pokeapi.co/api/v2/pokemon?limit=2000` )
        results.forEach( ( { name, url } ) => {
            const segments = url.split( '/' )
            const number: number = +segments.at( -2 )
            console.log( { name, number } )
        } )
        return
    }
}
```

Para la inserción de los pokemons debemos hacer la inyección del servicio de pokemon dentro del servicio seed, por lo tanto debemos exportar el primer service en su modulo, y posteriormente importar el módulo completo de pokemon dentro del módulo del seed:

```ts
import { PokemonService } from './pokemon.service'
...

@Module( {
    ...,
    exports: [ PokemonService ]
} )
export class PokemonModule { }
```

```ts
import { PokemonModule } from '../pokemon/pokemon.module'
...

@Module( {
    ...,
    imports: [ PokemonModule ]
} )
export class SeedModule { }
```

Ahora si procedemos a la inyección entre servicios:

```ts
import { PokemonService } from 'src/pokemon/pokemon.service'
...

@Injectable()
export class SeedService {
    constructor ( private readonly _pokemonService: PokemonService ) { }
    ...
}
```

Dentro del método para poblar la base de datos llamamos la función `create` del servicio de Pokemon, dentro de cada ciclo for para insertar la data:

```ts
@Injectable()
export class SeedService {
    private readonly _axios: AxiosInstance = axios

    constructor ( private readonly _pokemonService: PokemonService ) { }

    async populateDB () {
        const { data: { results } } = await this._axios.get<IPokeResponse>( `https://pokeapi.co/api/v2/pokemon?limit=2000` )
        results.forEach( ( { name, url } ) => {
            const segments = url.split( '/' )
            const number: number = +segments.at( -2 )
            this._pokemonService.create( { name: name.toLowerCase(), number } )
        } )
        return
    }
}
```

Otra manera es usando el modelo de Pokemon y no el servicio del mismo módulo. Lo primero será exportar la configuración del módulo de mongoose dentro del módulo de Pokemon

```ts
import { MongooseModule } from '@nestjs/mongoose'
...

@Module( {
    ...,
    imports: [
        MongooseModule.forFeature( [
            {
                name: Pokemon.name,
                schema: PokemonSchema
            }
        ] )
    ],
    exports: [ MongooseModule ]
} )
export class PokemonModule { }
```

Seguimos con la importación del módulo de Pokemon dentro del módulo Seed, pero si vamos a modificar el servicio de la siguiente manera:

```ts
@Injectable()
export class SeedService {
    private readonly _axios: AxiosInstance = axios

    constructor ( @InjectMode( Pokemon.name ) private readonly _pokemonModel: Model<Pokemon> ) { }

    async populateDB () {
        const { data: { results } } = await this._axios.get<IPokeResponse>( `https://pokeapi.co/api/v2/pokemon?limit=2000` )
        results.forEach( async ( { name, url } ) => {
            const segments = url.split( '/' )
            const number: number = +segments.at( -2 )
            const pokemon = await this._pokemonModel.create({ name: name.toLowerCase(), number })
        } )
        return
    }
}
```

En siguientes secciones veremos otra opción y cual podría ser mejor para la inserción de múltiples documentos.

## Insertar múltiples registros simultáneamente

En la lección anterior vimos dos opciones de como guardar los registros en el servicio del Seed. Tanto la primera como la segunda opción presentan el inconveniente de que es muy tardada la inserción de los datos dentro de la base de datos, puesto que se tiene que esperar que termine una inserción para pasar a la siguiente, entonces, si son múltiples registros el tiempo se incrementa por cada uno. Al momento de imprimir el tiempo de ejecución desde el controlador, con los dos métodos anteriores tenemos resultados en un rango de entre `40ms` a `55ms`.

Vamos a intentar con otra solución, en la cual creamos un arreglo al cual le enviamos todas las promesas de inserción en la base de datos en cada recorrido del array, y luego ejecutamos todas las promesas mediante `Promises.all`. El tiempo de ejecución va de los `0.1ms` a los `3ms`:

```ts
@Injectable()
export class SeedService {
    ...
    constructor (
        @InjectModel( Pokemon.name ) private readonly _pokemonModel: Model<Pokemon>
    ) { }

    async populateDB () {
        await this._pokemonModel.deleteMany( {} )

        const { data: { results } } = await this._axios.get<IPokeResponse>( `https://pokeapi.co/api/v2/pokemon?limit=2000` )

        const insertPromisesArray = []

        results.forEach( async ( { name, url } ) => {
            const segments = url.split( '/' )
            const number: number = +segments.at( -2 )
            insertPromisesArray.push(
                this._pokemonModel.create( { name, number } )
            )
        } )

        await Promise.all( insertPromisesArray )

        return "Seed Executed"
    }
}
```

Con el anterior método usamos la inserción 1 a 1 de los registros, pero podemos usar la inserción múltiple que ya nos ofrece mongoose. El tiempo de ejecución está en un rango similar al anterior, pero el código es más limpio:

```ts
@Injectable()
export class SeedService {
    ...
    constructor (
        @InjectModel( Pokemon.name ) private readonly _pokemonModel: Model<Pokemon>
    ) { }

    async populateDB () {
        await this._pokemonModel.deleteMany( {} )

        const { data: { results } } = await this._axios.get<IPokeResponse>( `https://pokeapi.co/api/v2/pokemon?limit=2000` )

        const pokemonToInsert: { name: string, number: number }[] = []

        results.forEach( async ( { name, url } ) => {
            const segments = url.split( '/' )
            const number: number = +segments.at( -2 )
            pokemonToInsert.push( { name, number } )
        } )

        await this._pokemonModel.insertMany( pokemonToInsert )

        return "Seed Executed"
    }
}
```