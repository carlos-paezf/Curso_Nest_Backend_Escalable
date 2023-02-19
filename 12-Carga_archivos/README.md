# Sección 12: Carga de archivos

En esta sección trabajaremos con la carga de archivos a nuestro backend. Idealmente recordar, que no es recomendado colocar archivos físicamente en nuestro backend, lo que se recomienda es subirlos y colocarlos en un hosting o servicio diferente.

Pero el conocimiento de tomar y ubicar el archivo en otro lugar de nuestro file system es bastante útil.

Aquí veremos validaciones y control de carga de cualquier archivo hacia nuestro backend.

## Continuación del proyecto

Vamos a seguir usando el proyecto de la sección anterior, por lo que podemos usar el siguiente comando para copiarlo:

```txt
$: cp -r 11-Relaciones_TypeORM/teslo-shop 12-Carga_archivos/
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
