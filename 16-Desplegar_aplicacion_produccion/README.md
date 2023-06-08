# Sección 16: Desplegar toda la aplicación a producción

Esta sección trabajaremos en desplegar todo el backend y frontend, pero puntualmente aprenderemos:

- Heroku CLI
- Logs y Tails de logs
- Manejo de errores en producción
- Configuración de variables de entorno
- Postgres en la nube
- Despliegue en Netlify
- Pruebas de aplicación
- CORS
- Generar build de producción VITE
- y mucho más

## Continuación de la sección

Para esta sección vamos a usar el proyecto de la sección anterior, por lo que vamos a copiar el proyecto con el siguiente comando:

```txt
$: cp -r 15-Websockets/teslo-websockets 16-Desplegar_aplicacion_produccion
$: cp -r 15-Websockets/ws-client 16-Desplegar_aplicacion_produccion
```

Hacemos la instalación de los `node_modules` con el siguiente comando:

```txt
$: pnpm install
```

Levantamos la base de datos con el comando:

```txt
$: docker-compose up -d
```

Y levantamos el proyecto backend con el siguiente comando:

```txt
$: pnpm start:dev
```

En caso de no tener registros en la base de datos, vamos a ejecutar el siguiente endpoint: `http://localhost:3000/api/seed`

Para el proyecto cliente frontend usamos el siguiente comando para levantar la aplicación:

```txt
$: pnpm dev
```
