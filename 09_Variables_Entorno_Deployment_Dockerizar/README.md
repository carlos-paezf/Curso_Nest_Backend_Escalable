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
    port: process.env.PORT || 3001,
    defaultLimit: process.env.DEFAULT_LIMIT || 5
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
