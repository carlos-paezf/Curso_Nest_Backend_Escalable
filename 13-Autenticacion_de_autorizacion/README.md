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

## Entidad de Usuarios

Necesitamos una entidad de usuarios para controlar la creación y actualización de los productos, además de que es indispensable para la autenticación y autorización de los mismos. Vamos a crear un nuevo recurso con el siguiente comando:

```txt
$: nest g res auth --no-spec
? What transport layer do you use? REST API
? Would you like to generate CRUD entry points? Yes
```

Dentro de la entidad de autenticación vamos a realizar el siguiente cambio (también cambiamos el nombre del archivo a `user.entity.ts`):

```ts
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity( 'users' )
export class User {
    @PrimaryGeneratedColumn( 'uuid' )
    id: string

    @Column( 'text', {
        unique: true
    } )
    email: string

    @Column( 'text' )
    password: string

    @Column( 'text' )
    fullName: string

    @Column( 'bool' )
    isActive: boolean

    @Column( {
        type: 'text',
        array: true,
        default: [ 'user' ]
    } )
    roles: string[]
}
```

Ahora, para que TypeORM reconozca esta entidad como una tabla dentro de la base de datos, debemos ir al archivo `auth.module.ts` para realizar la siguiente importación y configuración:

```ts
import { TypeOrmModule } from '@nestjs/typeorm'
import { User } from './entities/user.entity'
...
@Module( {
    imports: [
        TypeOrmModule.forFeature( [
            User
        ] ),
    ],
    ...
} )
export class AuthModule { }
```

Como tenemos activa la función de sincronización, vamos a observar los cambios una vez guardado el proyecto y recargado el gestor la bases de datos. En caso de estar en producción se debe trabajar con migraciones.
