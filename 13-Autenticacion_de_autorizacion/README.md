# Sección 13: Autenticación de autorización

Esta es una de las secciones más grandes del curso y está cargada de muchos conceptos nuevos, mi recomendación tratar de digerirla en dos jornadas de estudio en lugar de intentar verla completamente en una sola corrida.

Puntualmente veremos:

- Autenticación
- Autorización
- Json Web Tokens
- Hash de contraseñas
- Nest Passport
- Módulos asíncronos
- Protección de rutas
- Custom Method Decorators
- Custom Class Decorators
- Custom Property Decorators
- Enlazar usuarios con productos
- Bearer Tokens
- Y mucho más

## Continuación de proyecto

Vamos a seguir usando el proyecto de la sección anterior, por lo que podemos usar el siguiente comando para copiarlo:

```txt
$: cp -r 12-Carga_archivos/teslo-shop 13-Autenticacion_de_autorizacion/
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
