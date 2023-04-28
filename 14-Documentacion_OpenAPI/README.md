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
