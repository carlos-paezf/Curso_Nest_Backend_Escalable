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
