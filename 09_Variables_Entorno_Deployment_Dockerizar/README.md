# Sección 09: Variables de entorno - Deployment y Dockerizar la aplicación

En esta sección trabajaremos en la configuración de variables de entorno y su validación:

Puntualmente veremos:

- Dockerizacion
- Mongo Atlas
- Env file
- joi
- Validation Schemas
- Configuration Module
- Recomendaciones para un Readme útil
- Despliegues
- Dockerfile

## Continuación del proyecto

Vamos a seguir usando el proyecto de la sección anterior, por lo que podemos usar el siguiente comando para copiarlo:

```txt
$: cp -r 08_Seed_Paginacion/pokedex 09_Variables_Entorno_Deployment_Dockerizar/
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

Para poblar la base de datos tenemos que realizar una petición GET al endpoint `http://localhost:3000/api/seed` y podemos usar curl para esa tarea con el siguiente comando (está es una de las muchas opciones):

```txt
$: curl http://localhost:3000/api/seed
```

## Configuración de variables de entorno

Las variables de entorno nos permiten definir los valores respectivos a cada entorno, nos ayuda a no cambiar de manera manual código que puede cambiar según la etapa y el ambiente en el que corre. Vamos a crear el archivo `.env` para dicho fin, de paso lo añadimos a la lista de `.gitignore`.

Dentro de las variables de entorno vamos a añadir lo siguiente:

```.env
MONGO_DB = "mongodb://localhost:27017/nest-pokemon"
PORT = 3000
```

Para reconocer las variables de entorno dentro del proyecto, añadimos un nuevo paquete con el siguiente comando:

```txt
$: pnpm i @nestjs/config
```

Luego debemos ir a `app.module.ts` y añadir la siguiente configuración:

```ts
import { ConfigModule } from '@nestjs/config'
...

@Module( {
    imports: [
        ConfigModule.forRoot(),
        ...
    ]
} )
export class AppModule { }
```

Si queremos comprobar que nuestro proyecto ya lee las variables de entorno tanto del equipo como local de la app, podemos imprimirlas en consola. Tener en cuenta que todas las variables serán de tipo string sin importar que las hayamos definido como number u otro tipo en el archivo `.env`

```ts
@Module( { ... } )
export class AppModule { 
    constructor() {
        console.log( process.env )
    }
}
```

Con las variables siendo reconocidas, podemos aplicar los cambios necesarios en nuestra aplicación para la conexión de mongo y el puerto de ejecución del proyecto:

```ts
@Module( {
    imports: [
        ...,
        MongooseModule.forRoot( process.env.MONGO_DB ),
        ...
    ]
} )
export class AppModule { }
```

## Configuration Loader

Es importante que el `ConfigurationModule` siempre este en el inicio de toda la configuración. Podemos hacer uso de las variables de entorno de manera directa dentro del código, pero el problema será al momento de no tener un valor asignado a la variables, o no tener en si la propia variable.

Por ejemplo, queremos establecer mediante variable de entorno un limite de registros para las consultas GET en donde no se especifique el puerto. Dada la casualidad no se ha definido la variable dentro del archivo `.env`, pero aún así la usamos dentro del método del servicio:

```ts
@Injectable()
export class PokemonService {
    ...
    findAll ( { limit = +process.env.DEFAULT_LIMIT, offset = 0 }: PaginationDto ) {
        return this._pokemonModel
            .find()
            .limit( limit )
            .skip( offset )
            .sort( {
                number: 1
            } )
            .select( '-__v' )
    }
    ...
}
```

Como la variable `process.env.DEFAULT_LIMIT` no ha sido definida, su valor será `undefined` y al momento de parsearla a numérico tendremos un `NaN`, el cual es reconocido como valido por Mongo y por lo tanto nos retornará todos los documentos almacenados en la colección.

Una solución elegante es mapear las variables de entorno y establecer valores por defecto en caso de ser necesario y lógico en cada variable. Esto lo vamos a aplicar dentro del archivo `config/app.config.ts`, en donde exportamos una función que exporta un objeto con las variables mapeadas:

```ts
export const EnvConfiguration = () => ( {
    environment: process.env.NODE_ENV || 'dev',
    mongodb: process.env.MONGO_DB,
    port: +process.env.PORT || 3001,
    defaultLimit: +process.env.DEFAULT_LIMIT || 5
} )
```

Como vemos la mayoría de las variables poseen valores por defecto, excepto la conexión con la base de datos, y esto es por qué queremos lanzar un error ya que la base de datos debería ser lanzada primero.

Ahora, vamos a reconocer esta función dentro del `app.module.ts`:

```ts
import { EnvConfiguration } from './config/app.config'
...

@Module( {
    imports: [
        ConfigModule.forRoot( {
            load: [ EnvConfiguration ]
        } ),
        ...
    ]
} )
export class AppModule { }
```

Dentro del proyecto ya no vamos a usar más `process.env` para reconocer las variables, lo vamos a reemplazar por un servicio que nos ofrece `ConfigModule`.

## ConfigurationService

`ConfigurationService` es un servicio que nos permite usar las variables mapeadas con anterioridad. Se debe hacer la inyección del mismo dentro de las clases en los que se debe usar, pero antes se debe importar dentro del módulo a usar:

```ts
@Module( {
    ...,
    imports: [
        ConfigModule,
        ...
    ]
    ...
} )
export class PokemonModule { }
```

Procedemos con la inyección del servicio:

```ts
import { ConfigService } from '@nestjs/config'
...

@Injectable()
export class PokemonService {
    constructor (
        ...,
        private readonly _configService: ConfigService
    ) { }
    ...
}
```

En estos momentos podemos hacer uso del servicio para obtener las variables definidas en el mapeo:

```ts
@Injectable()
export class PokemonService {
    constructor ( ... ) {
        const defaultLimit = this._configService.get<number>( 'defaultLimit' )
        console.log( { defaultLimit, type: typeof defaultLimit } )              // { defaultLimit: 10, type: 'number' }
    }
    ...
}
```

Para efecto práctico dentro de nuestro proyecto, vamos a usar el valor de la variable en el método correspondiente. En caso de necesitemos dicho valor en varios lugares, podemos crear una propiedad dentro de la clase y asignar su valor dentro del constructor.

```ts
@Injectable()
export class PokemonService {
    private _defaultLimit: number

    constructor ( ... ) {
        this._defaultLimit = this._configService.get<number>( 'defaultLimit' )
    }
    ...
    findAll ( { limit = this._defaultLimit, offset = 0 }: PaginationDto ) { ... }
    ...
}
```

Debemos tener en cuenta que toda la configuración anterior solo la podemos aplicar dentro de los Building Blocks de Nest, en los demás archivos si podemos hacer uso de `process.env` para obtener las variables de entorno. Tal es el caso del archivo `main.ts` en donde se define el puerto de la aplicación:

```ts
async function bootstrap () {
    ...
    await app.listen( Number( process.env.PORT ) || 3001 )
    ...
}
```

## Joi - ValidationSchema

Si queremos ser más estrictos con el valor de las variables de entorno y manejar los errores del mismo, podemos usar la librería `joi` con el siguiente comando:

```txt
$: pnpm install joi
```

Con el paquete instalado, creamos el archivo `config/joi.validation.ts` en donde establecemos las reglas de validación para las variables:

```ts
import * as Joi from 'joi'

export const JoiValidationSchema = Joi.object( {
    MONGO_DB: Joi.required(),
    PORT: Joi.number().default( 3002 ),
    DEFAULT_LIMIT: Joi.number().default( 6 )
} )
```

Este esquema lo usamos en `app.module.ts`:

```ts
import { JoiValidationSchema } from './config/joi.validation'
...

@Module( {
    imports: [
        ConfigModule.forRoot( {
            load: [ EnvConfiguration ],
            validationSchema: JoiValidationSchema
        } ),
        ...
    ]
} )
export class AppModule { }
```

Es importante reconocer la prioridad de ejecución entre los archivos `app.config.ts` y `joi.validation.ts`, puesto que el segundo archivo se ejecuta primero y por lo tanto define el valor de las variables de entorno que no están definidas, pero se deben mantener las validaciones con mucho cuidado en ambos archivos en caso de querer usarlos a la vez, especialmente en el tipo de dato.

## ENV Template

Siempre es aconsejable que se tenga un archivo que sirva de ejemplo o template de las variables de entorno, puesto que el archivo `.env` no se debe cargar a un espacio público. Podemos copiar el valor de las variables que no afectan de manera directa la información de la aplicación, como por ejemplo el puerto de la aplicación o el limite de resultados, pero, debemos omitir el valor de las variables que requieren un gran secreto, como por ejemplo la firma de los JWT.

También es normal definir los pasos necesarios para la configuración de la aplicación dentro de un archivo `README.md`, con el fin de que cualquier desarrollador pueda levantar de manera correcta el proyecto.
