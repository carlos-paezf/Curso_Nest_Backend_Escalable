# Sección 11: Relaciones en TypeORM

Esta sección está cargada de contenido nuevo para trabajar con bases de datos relacionales.

Temas que veremos:

- Relaciones
  - De uno a muchos
  - Muchos a uno
- Query Runner
- Query Builder
- Transacciones
- Commits y Rollbacks
- Renombrar tablas
- Creación de un SEED
- Aplanar resultados

La idea es hacer que nuestro endpoint de creación y actualización de producto permita la actualización de una tabla secundaria de la misma forma como lo hemos creado en la sección pasada.

## Continuación del proyecto

Vamos a seguir usando el proyecto de la sección anterior, por lo que podemos usar el siguiente comando para copiarlo:

```txt
$: cp -r 10_TypeORM_Postgres/teslo-shop 11_Relaciones_TypeORM/
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
