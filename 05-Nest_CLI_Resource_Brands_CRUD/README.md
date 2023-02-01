# Sección 05: Nest CLI Resource - Brands CRUD

Esta sección es básicamente un reforzamiento de lo aprendido hasta el momento, pero le adicionamos la comunicación entre módulos y servicios.

Puntualmente:

- SEED Endpoint
  - Llenar data de Carros y Marcas
  - Comunicar módulo seed, con los otros módulos de nuestra aplicación
- Errores comunes a la hora de utilizar módulos enlazados
- Problemas con inyección de dependencias de módulos externos
- Brands CRUD completo
  - Endpoints
  - DTOs
  - Servicios
  - Controladores

## Continuación del proyecto

Vamos a usar el proyecto de la sección pasada, por lo que para reconstruir los `node_modules` usamos el comando de `pnpm install` o `pnpm i`, y para levantar el proyecto usamos el comando `pnpm start:dev`. Podemos copiar el proyecto a través de consola con el comando:

```txt
$: cp -r 04-DTOs_Validacion_informacion/car-dealership/ 05-Nest_CLI_Resource_Brands_CRUD
```

## Nest CLI Resource - Brands

Vamos a crear un nuevo CRUD relacionados a las marcas o brands en inglés. Podríamos crear todo manualmente como en la sección pasada, pero Nest se dió cuenta que es una tarea común por lo que añadió una funcionalidad llamada `resource`, el cual para usarlo ejecutamos el siguiente comando:

```txt
$: nest g resource brands --no-spec
```

Una vez ejecutado el comando, debemos seleccionar la capa de transporte que estamos usando, en este caso será REST API. Lo siguiente es seleccionar si queremos generar los puntos de entrada del CRUD, y le decimos que si. Lo que veremos de la ejecución del comando será lo siguiente:

```txt
$: nest g resource brands --no-spec
? What transport layer do you use? REST API
? Would you like to generate CRUD entry points? Yes
CREATE src/brands/brands.controller.ts (915 bytes)
CREATE src/brands/brands.module.ts (254 bytes)
CREATE src/brands/brands.service.ts (623 bytes)
CREATE src/brands/dto/create-brand.dto.ts (31 bytes)
CREATE src/brands/dto/update-brand.dto.ts (173 bytes)
CREATE src/brands/entities/brand.entity.ts (22 bytes)
UPDATE src/app.module.ts (297 bytes)
```

## Crear CRUD completo de Brands

Vamos a crear el CRUD completo para el módulo de Brands. Lo primero es definir la entidad:

```ts
export class Brand {
    id: string
    name: string

    createdAt: number
    updatedAt?: number
}
```

Una entidad es una clase que nos permite definir una gran variedad de validaciones para las propiedades que le establezcan para el objeto. Más adelante vamos a observar como nos ayuda en la creación de tablas o documentos en bases de datos.

Pasamos al servicio de los brands para crear un arreglo con la data que vamos a manejar inicialmente:

```ts
import { v4 as uuid } from 'uuid'
import { Brand } from './entities/brand.entity'
...

@Injectable()
export class BrandsService {
    private _brands: Brand[] = [
        {
            id: uuid(),
            name: "Toyota",
            createdAt: new Date().getTime()
        }
    ]
    ...
}
```

Al momento de usar los recursos, Nest define los id de tipo número, pero nosotros lo necesitamos de tipo string, por lo que, en los métodos donde se hace uso del id, reemplazamos el tipo:

```ts
@Injectable()
export class BrandsService {
    ...
    findOne ( id: string ) { ... }

    update ( id: string, updateBrandDto: UpdateBrandDto ) { ... }

    remove ( id: string ) { ... }
}
```

También vamos a modificar el DTO de creación con las propiedades que esperamos y las validaciones esperadas:

```ts
import { IsString, MinLength } from "class-validator"

export class CreateBrandDto {
    @IsString()
    @MinLength( 1 )
    name: string
}
```

Y algo muy similar con el DTO de la actualización, puesto que solo tenemos una propiedad que se debe enviar en el cuerpo de la petición:

```ts
import { IsString, MinLength } from "class-validator"

export class UpdateBrandDto {
    @IsString()
    @MinLength( 1 )
    name: string
}

```

Con esas configuraciones iniciales pasamos a crear el cuerpo de los métodos en los servicios:

```ts
@Injectable()
export class BrandsService {
    private _brands: Brand[] = [
        {
            id: uuid(),
            name: "Toyota",
            createdAt: new Date().getTime()
        }
    ]

    create ( createBrandDto: CreateBrandDto ) {
        const { name } = createBrandDto

        const brand: Brand = {
            id: uuid(),
            name: name.toLowerCase(),
            createdAt: new Date().getTime()
        }

        this._brands.push( brand )

        return brand
    }

    findAll () {
        return this._brands
    }

    findOne ( id: string ) {
        const brand = this._brands.find( brand => brand.id === id )
        if ( !brand )
            throw new NotFoundException( `Brand with id ${ id } not found` )
        return brand
    }

    update ( id: string, updateBrandDto: UpdateBrandDto ) {
        let brandDB = this.findOne( id )
        this._brands = this._brands.map( brand => {
            if ( brand.id === id ) {
                brandDB.updatedAt = new Date().getTime()
                brandDB = { ...brandDB, ...updateBrandDto }
                return brandDB
            }
            return brand
        } )
    }

    remove ( id: string ) {
        this._brands = this._brands.filter( brand => brand.id !== id )
    }
}
```

Por último terminamos de construir las funciones en el controlador:

```ts
@Controller( 'brands' )
export class BrandsController {
    constructor ( private readonly brandsService: BrandsService ) { }

    @Post()
    create ( @Body() createBrandDto: CreateBrandDto ) {
        return this.brandsService.create( createBrandDto )
    }

    @Get()
    findAll () {
        return this.brandsService.findAll()
    }

    @Get( ':id' )
    findOne ( @Param( 'id', new ParseUUIDPipe( { version: '4' } ) ) id: string ) {
        return this.brandsService.findOne( id )
    }

    @Patch( ':id' )
    update (
        @Param( 'id', new ParseUUIDPipe( { version: '4' } ) ) id: string,
        @Body() updateBrandDto: UpdateBrandDto
    ) {
        return this.brandsService.update( id, updateBrandDto )
    }

    @Delete( ':id' )
    remove ( @Param( 'id', new ParseUUIDPipe( { version: '4' } ) ) id: string ) {
        return this.brandsService.remove( id )
    }
}
```

Y así de fácil construimos un CRUD básico mediante los resource de Nest.

## Crear servicio SEED para cargar datos

Vamos a generar un SEED o semilla con el fin de tener datos pre-cargados que se puedan usar para probar y recuperar la aplicación en caso de que ejecute algún comando destructivo. El seed solo se puede ejecutar en entorno de desarrollo.

Lo primero será generar un resource para el SEED:

```txt
$: nest g res seed --no-spec
? What transport layer do you use? REST API
? Would you like to generate CRUD entry points? Yes
CREATE src/seed/seed.controller.ts (883 bytes)
CREATE src/seed/seed.module.ts (240 bytes)
CREATE src/seed/seed.service.ts (607 bytes)
CREATE src/seed/dto/create-seed.dto.ts (30 bytes)
CREATE src/seed/dto/update-seed.dto.ts (169 bytes)
CREATE src/seed/entities/seed.entity.ts (21 bytes)
UPDATE src/app.module.ts (358 bytes)
```

Para este nuevo módulo vamos a eliminar algunos archivos que no necesitamos, como lo son los DTOs y el entity, dentro del método del controlado solo creamos un método get:

```ts
import { Controller, Get } from '@nestjs/common'
import { SeedService } from './seed.service'

@Controller( 'seed' )
export class SeedController {
    constructor ( private readonly seedService: SeedService ) { }

    @Get()
    runSeed () {
        return this.seedService.populateDB()
    }
}
```

Y ahora definimos el método del servicio, pero aún no vamos definir sus acciones, lo haremos en las siguientes lecciones:

```ts
import { Injectable } from '@nestjs/common'

@Injectable()
export class SeedService {
    populateDB () {
        return 'SEED Execute'
    }
}
```
