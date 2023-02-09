import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { Product } from './product.entity'

@Entity()
export class ProductImage {
    @PrimaryGeneratedColumn( 'rowid' )
    id: number

    @Column( 'text' )
    url: string

    @ManyToOne(
        () => Product,
        product => product.images
    )
    product: Product
}