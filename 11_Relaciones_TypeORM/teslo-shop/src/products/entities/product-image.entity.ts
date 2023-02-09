import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity()
export class ProductImage {
    @PrimaryGeneratedColumn( 'rowid' )
    id: number

    @Column( 'text' )
    url: string
}