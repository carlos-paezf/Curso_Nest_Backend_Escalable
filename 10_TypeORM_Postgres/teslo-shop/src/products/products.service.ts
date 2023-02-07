import { Injectable, InternalServerErrorException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { red } from 'colors'
import { Repository } from 'typeorm'
import { CreateProductDto } from './dto/create-product.dto'
import { UpdateProductDto } from './dto/update-product.dto'
import { Product } from './entities/product.entity'

@Injectable()
export class ProductsService {
    constructor ( @InjectRepository( Product ) private readonly _productRepository: Repository<Product> ) { }

    async create ( createProductDto: CreateProductDto ) {
        try {
            const product = this._productRepository.create( createProductDto )
            await this._productRepository.save( product )
            return product
        } catch ( error ) {
            console.error( red( "> Error in ProductsService:create = " ), error )
            throw new InternalServerErrorException()
        }
    }

    findAll () {
        return `This action returns all products`
    }

    findOne ( id: number ) {
        return `This action returns a #${ id } product`
    }

    update ( id: number, updateProductDto: UpdateProductDto ) {
        return `This action updates a #${ id } product`
    }

    remove ( id: number ) {
        return `This action removes a #${ id } product`
    }
}
