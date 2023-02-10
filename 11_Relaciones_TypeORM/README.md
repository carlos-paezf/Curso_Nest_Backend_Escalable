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

## ProductImage Entity

No vamos a crear un nuevo módulo, por que no queremos tener un CRUD independiente para las imágenes, por lo tanto vamos a crear la nueva entidad dentro del módulo de productos.

```ts
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity()
export class ProductImage {
    @PrimaryGeneratedColumn( )
    id: number

    @Column( 'text' )
    url: string
}
```

Para que TypeORM reconozca la entidad, debemos ir a `products.module.ts` y añadir la clase en la configuración `forFeature` de TypeOrmModule:

```ts
import { Product, ProductImage } from './entities'
...

@Module( {
    ...,
    imports: [
        TypeOrmModule.forFeature( [
            Product,
            ProductImage
        ] )
    ]
} )
export class ProductsModule { }
```

## OneToMay y ManyToOne

Para realizar estas relaciones debemos saber la cardinalidad de la relación, en este caso `1` producto puede tener `n` imágenes (`1:n`), y muchas imágenes puede tener 1 dueño (`n:1`).

Dentro de las entidades debemos crear propiedades que nos ayuden a relacionarse entre si. Primero haremos la relación `1:n` de los productos hacia las imágenes, y definimos que sea de tipo cascade para todas las acciones (podemos usar cualquiera de estas opciones `("insert" | "update" | "remove" | "soft-remove" | "recover")`):

```ts
import { ..., OneToMany } from "typeorm"
import { ProductImage } from './product-image.entity'

@Entity()
export class Product {
    ...
    @OneToMany(
        () => ProductImage,
        productImage => productImage.product,
        { cascade: true }
    )
    images?: ProductImage[]
    ...
}
```

Ahora creamos la propiedad `product` para la relación `n:1` dentro de la entidad `ProductImage`:

```ts
import { ..., ManyToOne } from 'typeorm'
import { Product } from './product.entity'

@Entity()
export class ProductImage {
    ...
    @ManyToOne(
        () => Product,
        product => product.images
    )
    product: Product
}
```

Siempre debemos hacernos la pregunta *¿Merece la pena, crear una nueva tabla para relacionarla con una existente?*, y nos respondemos a esa pregunta con esta deducción: Si creamos una nueva columna que puede tener datos nulos, es mejor crear una nueva relación, de lo contrario mantengamos una columna con el arreglo de datos.

## Crear imágenes de producto

Cuando se quiere enviar imágenes a nuestro endpoint de creación o de actualización, obtendremos un error por qué no están definidas dentro de los DTO, y por ello debemos añadir la siguiente configuración dentro del DTO de creación:

```ts
export class CreateProductDto {
    ...
    @IsOptional()
    @IsString( { each: true } )
    @IsArray()
    images?: string[]
}
```

Para recibir las imágenes debemos realizar una modificación dentro del servicio del producto y aplicar una corrección en los métodos de creación y actualización:

```ts
@Injectable()
export class ProductsService {
    ...
    async create ( createProductDto: CreateProductDto ) {
        try {
            const { images = [], ...productDetails } = createProductDto

            const product = this._productRepository.create( { ...productDetails } )
            ...
        } catch ( error ) { ... }
    }
    ...
    async update ( id: string, updateProductDto: UpdateProductDto ) {
        const product = await this._productRepository.preload( {
            id, ...updateProductDto, images: []
        } )
        ...
    }
    ...
}
```

Con lo anterior recibimos la imágenes, pero no las guardamos en la base de datos, ya que no son instancias de la entidad `ProductImage`. Buscando este fin, debemos inyectar un repositorio de la clase mencionada anteriormente:

```ts
import { Repository } from 'typeorm'
...
@Injectable()
export class ProductsService {
    ...
    constructor (
        ...,
        @InjectRepository( ProductImage ) private readonly _productImageRepository: Repository<ProductImage>,
    ) { }
    ...
}
```

Ahora si podemos enviar las instancias de imágenes a la base de datos al momento de crear:

```ts
@Injectable()
export class ProductsService {
    ...
    constructor (
        @InjectRepository( Product ) private readonly _productRepository: Repository<Product>,
        @InjectRepository( ProductImage ) private readonly _productImageRepository: Repository<ProductImage>,
    ) { }

    async create ( createProductDto: CreateProductDto ) {
        try {
            const { images = [], ...productDetails } = createProductDto

            const product = this._productRepository.create( {
                ...productDetails,
                images: images.map( url => this._productImageRepository.create( { url } ) )
            } )

            ...
        } catch ( error ) { ... }
    }
    ...
}
```

Para evitar que el usuario vea las instancias de las imágenes creadas, retornamos un nuevo objeto con las mismas imágenes que nos envía en el body:

```ts
@Injectable()
export class ProductsService {
    ...
    async create ( createProductDto: CreateProductDto ) {
        try {
            const { images = [], ...productDetails } = createProductDto
            ...
            return { ...product, images}
        } catch ( error ) { ... }
    }
    ...
}
```

## Aplanar las imágenes

Si consultamos todos los productos, no podremos ver la propiedad de imágenes, y esto se debe a que es una relación, y para poder imprimirla debemos hacer lo siguiente en el servicio:

```ts
@Injectable()
export class ProductsService {
    ...
    async findAll ( ... ) {
        const { 0: data, 1: totalResults } = await this._productRepository.findAndCount( {
            ...,
            relations: {
                images: true
            }
        } )
        ...
    }
    ...
}
```

Con lo anterior traemos toda la información relaciona a la imagen, puesto que estamos aplicando una consulta LEFT JOIN a la base de datos. Si solo queremos un arreglo con las urls de la imágenes, entonces aplicamos la siguiente estrategia:

```ts
@Injectable()
export class ProductsService {
    ...
    async findAll ( ... ) {
        ...
        return {
            ...,
            data: data.map( ( { images, ...product } ) => ( { ...product, images: images.map( img => img.url ) } ) )
        }
    }
    ...
}
```

Cuando hacemos la consulta de un único producto, volvemos a encontrarnos con el problema de que no contamos con la propiedad en la respuesta, y que en esta ocasión no tenemos la opción de `relations` para hacer la consulta con el método `findOneBy`. Una opción es usar el método `findOne` que si tiene la propiedad `relations`, o usar la función `createQueryBuilder`. Pero en realidad hay una manera más sencilla y usar `Eager relations` el cual funciona con cualquier método `find*`, esta estrategia la configuramos en el la entidad producto, en la propiedad asociada con con la tabla de imágenes:

```ts
import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm"
import { ProductImage } from './product-image.entity'

@Entity()
export class Product {
    ...
    @OneToMany(
        () => ProductImage,
        productImage => productImage.product,
        {
            cascade: true,
            eager: true
        }
    )
    images?: ProductImage[]
    ...
}
```

Tenemos el inconveniente de que las relaciones eager no se pueden usar en los Query Builder, en donde tendremos que usar `leftJoinAndSelect` para cargar la relación y definir un alías para la consulta:

```ts
@Injectable()
export class ProductsService {
    ...
    async findOne ( term: string ) {
        ...
        if ( !product )
            product = await this._productRepository.createQueryBuilder( 'product' )
                .where( ... )
                .leftJoinAndSelect( 'product.images', 'productImages' )
                .getOne()
        ...
    }
    ...
}
```

Para aplanar el resultado y no afectar el método `remove`, creamos una función con tal objetivo que será usada dentro del controlador, pero que a su vez sigue usando el método original de `findOne`:

```ts
@Injectable()
export class ProductsService {
    ...
    async findOnePlain ( term: string ) {
        const { images = [], ...rest } = await this.findOne( term )
        return {
            ...rest,
            images: images.map( image => image.url )
        }
    }
    ...
}
```

```ts
@Controller( 'products' )
export class ProductsController {
    ...
    @Get( ':term' )
    findOne ( @Param( 'term' ) term: string ) {
        return this.productsService.findOnePlain( term )
    }
    ...
}
```

## Query Runner

Cuando queremos actualizar un producto, debemos actualizar la tabla de imágenes en caso de ser necesario. El primer caso es cuando nos envían un arreglo vacío para la propiedad `images`, en cuyo caso debemos eliminar todas las imágenes asociadas al producto, y el segundo caso es cuando recibimos un nuevo arreglo con imágenes que eliminan y reemplazan las que ya se encontraban en la tabla. Debemos aclarar que no debemos hacer nada en caso de que no nos envíen la propiedad `images` dentro de la consulta.

Lo primero que vamos a hacer es inyectar una instancia de `DataSource` con el fin de tener una referencia de nuestra base de datos, y que será usada por un queryRunner dentro el método de actualización. En la función de actualización desestructuramos la información que recibimos, y precargamos toda la información enviada, excepto las imágenes:

```ts
import { DataSource, ... } from 'typeorm'

@Injectable()
export class ProductsService {
    ...
    constructor (
        ...,
        private readonly _dataSource: DataSource
    ) { }
    ...
    async update ( id: string, updateProductDto: UpdateProductDto ) {
        const { images, ...toUpdate } = updateProductDto

        const product = await this._productRepository.preload( {
            id, ...toUpdate
        } )

        if ( !product )
            throw new NotFoundException( `Product with id '${ id }' not found` )

        const queryRunner = this._dataSource.createQueryRunner()

        try {
            return await this._productRepository.save( product )
        } catch ( error ) {
            this._handleDBException( error )
        }
    }
    ...
}
```

La idea que tenemos a continuación, es de ejecutar 2 transacciones antes de actualizar el producto. La primera transacción es eliminar las imágenes relacionadas al producto en caso de tener una arreglo vacío o un nuevo arreglo, y la segunda transacción es la inserción de las nuevas imágenes. Si alguna falla tendremos la oportunidad de realizar un RollBack a la base de datos.
