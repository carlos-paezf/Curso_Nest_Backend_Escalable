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
