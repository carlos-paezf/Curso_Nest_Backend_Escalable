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
