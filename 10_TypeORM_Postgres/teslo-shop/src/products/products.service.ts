import { BadRequestException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { CreateProductDto } from './dto/create-product.dto'
import { UpdateProductDto } from './dto/update-product.dto'
import { Product } from './entities/product.entity'
import { PostgreSQLErrorCodes } from '../commons/enums/db-error-codes.enum'

@Injectable()
export class ProductsService {
    private readonly _logger = new Logger( 'ProductsService' )

    constructor ( @InjectRepository( Product ) private readonly _productRepository: Repository<Product> ) { }

    async create ( createProductDto: CreateProductDto ) {
        try {
            const product = this._productRepository.create( createProductDto )
            await this._productRepository.save( product )
            return product
        } catch ( error ) {
            this._handleDBException( error )
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

    private _handleDBException ( error: any ) {
        if ( error.code === PostgreSQLErrorCodes.NOT_NULL_VIOLATION )
            throw new BadRequestException( error.detail )

        if ( error.code === PostgreSQLErrorCodes.UNIQUE_VIOLATION )
            throw new BadRequestException( error.detail )

        this._logger.error( error )
        console.error( error )
        throw new InternalServerErrorException( "Unexpected error, check server logs" )
    }
}
