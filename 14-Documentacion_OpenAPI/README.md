# Sección 14: Documentación OpenAPI

El objetivo de esta sección es trabajar con la documentación semi-automática que nos ofrece Nest para seguir  la especificación de OpenAPI

Puntualmente veremos:

- Postman documentation
- Nest Swagger

## Continuación del proyecto

Vamos a seguir usando el proyecto de la sección anterior, por lo que podemos usar el siguiente comando para copiarlo:

```txt
$: cp -r 13-Autenticacion_de_autorizacion/teslo-shop 14-Documentacion_OpenAPI
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

En caso de no tener registros en la base de datos, vamos a ejecutar el siguiente endpoint: `http://localhost:3000/api/seed`

## Documentación mediante Postman

Postman nos permite exportar los endpoints en un archivo JSON, el cual puede ser importado dentro otra instancia de Postman, ya sea en nuestro equipo o con una persona ajena. El problema es que hay elementos que podemos esperar y que no se exportan en los endpoints, como por ejemplo los query params, que si no añadimos, no serán reconocidos dentro de la documentación.

Otra ventaja de Postman, es que podemos hacer una publicación online de la documentación de los endpoints, para que las personas autorizadas puedan consultar la información respecto a los mismos. Además de que mediante las variables de entorno se pueden personalizar los valores se algunas variables según el entorno sobre el que se ejecuta.

En esta ocasión, no vamos a usar POSTMAN, sino que haremos uso del estándar de OpenAPI para documentar nuestro proyecto.

## NestJS Swagger

La especificación de OpenAPI es agnóstico al lenguaje sobre el cual se aplique, y por lo tanto nos permite tener un formato de definición para describir nuestras RESTful APIs. En Nest contamos con un modulo dedicado que nos permite la generación de documentación basado en decoradores dentro del código. Para hacer uso del módulo debemos hacer la siguiente instalación:

```txt
$: pnpm i --save @nestjs/swagger
```

Posteriormente, dentro del archivo `main.ts` debemos añadir la siguiente configuración:

```ts
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
...

async function bootstrap () {
    const app = await NestFactory.create( AppModule );
    ...
    const config = new DocumentBuilder()
        .setTitle( 'Teslo Shop RESTful API' )
        .setDescription( 'Teslo shop endpoints' )
        .setVersion( '1.0' )
        .build();

    const document = SwaggerModule.createDocument( app, config );
    SwaggerModule.setup( 'api', app, document );

    await app.listen( configService.get( 'PORT' ) );
    ...
}
...
```

Ahora, cuando ingresamos a `http://localhost:3000/api/` podremos observar todos los endpoints de nuestro backend, definiendo el verbo HTTP y el endpoint al cual apunta. Aunque esta nueva vista tiene lo básico de la documentación, debemos mejorarla mediante los decoradores que nos ofrece el módulo que acabamos de importar.
