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

## Subir un archivo al backend

Para subir un archivo a nuestro backend usaremos el paquete `multer`, el cual ya se encuentra en la instalaciones de nest, pero necesitamos instalar sus tipos, para lo cual usamos el siguiente comando:

```txt
$: pnpm i -D @types/multer
```

Ya que la carga de archivos es muy flexible para otros módulos, crearemos un nuevo resource:

```txt
$: nest g res files --no-spec
? What transport layer do you use? REST API
? Would you like to generate CRUD entry points? No
CREATE src/files/files.controller.ts (210 bytes)
CREATE src/files/files.module.ts (247 bytes)
CREATE src/files/files.service.ts (89 bytes)
UPDATE src/app.module.ts (1082 bytes)
```

Dentro del controlador creamos un método con el verbo POST, con el fin de cargar los archivos. Este método hace uso de un decorador `@UseInterceptors` para poder interceptar la llamada al endpoint y usar el interceptor de archivos, para indicarle al método como se llama la propiedad en donde se carga el archivo. La función hace uso de un parámetro de tipo `Express.Multer.File` apoyándose en el decorador `@UploadedFile`:

```ts
import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { FilesService } from './files.service'

@Controller( 'files' )
export class FilesController {
    constructor ( private readonly filesService: FilesService ) { }

    @Post( 'product' )
    @UseInterceptors( FileInterceptor( 'file' ) )
    uploadProductImage ( @UploadedFile() file: Express.Multer.File, ) {
        return file
    }
}
```

Cuando usamos el endpoint `http://localhost:3000/api/files/product/` con una propiedad de tipo File en el body, obtenemos un status 201, y el archivo es cargado en un directorio temporal al que no tenemos acceso aún.

## Validar archivos

En estos momentos necesitamos validar el tipo de archivo que se puede cargar, y para ello hay diversas propiedades del objeto, y una de ellas es `mimetype`, la cual contiene la extensión del archivo.

Creamos un helper que se encarga de recibir la request, el archivo y una función callback. Determinamos que si el archivo no se encuentra o la extensión del archivo no se encuentra dentro de nuestra whitelist de extensión, entonces mediante el callback enviamos un error y no dejamos pasar el archivo. En caso contrario determinamos que el archivo puede seguir al método:

```ts
export const fileFilter = ( req: Express.Request, file: Express.Multer.File, callback: Function ) => {
    if ( !file ) return callback( new Error( 'File is empty' ), false )

    const fileExtension = file.mimetype
        .split( '/' )
        .at( 1 )

    const validExtensions = [ 'jpg', 'jpeg', 'png', 'gif' ]

    if ( validExtensions.includes( fileExtension ) ) return callback( null, true )

    return callback( null, false )
}
```

Este helper lo usamos dentro del interceptor `FileInterceptor`, en sus opciones locales con la configuración de Multer, el cual le envía los parámetros necesarios a nuestro helper:

```ts
@Controller( 'files' )
export class FilesController {
    ...
    @Post( 'product' )
    @UseInterceptors( FileInterceptor( 'file', {
        fileFilter: fileFilter
    } ) )
    uploadProductImage ( @UploadedFile() file: Express.Multer.File, ) { ... }
}
```

Cuando no enviamos un archivo, o enviamos alguno con una extensión no permitida, recibimos un status 500, puesto que el archivo no está llegando al método del controlador y nosotros nos estamos controlando el error. En este caso aplicamos la siguiente corrección een el controller:

```ts
@Controller( 'files' )
export class FilesController {
    constructor ( private readonly filesService: FilesService ) { }

    @Post( 'product' )
    @UseInterceptors( FileInterceptor( 'file', {
        fileFilter: fileFilter
    } ) )
    uploadProductImage ( @UploadedFile() file: Express.Multer.File, ) {
        if ( !file ) throw new BadRequestException( "Make sure that the file is an image" )
        return {
            fileName: file.originalname
        }
    }
}
```
