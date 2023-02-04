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
