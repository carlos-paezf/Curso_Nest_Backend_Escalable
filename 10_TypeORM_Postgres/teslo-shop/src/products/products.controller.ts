import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common'
import { CreateProductDto } from './dto/create-product.dto'
import { UpdateProductDto } from './dto/update-product.dto'
import { ProductsService } from './products.service'

@Controller( 'products' )
export class ProductsController {
    constructor ( private readonly productsService: ProductsService ) { }

    @Post()
    create ( @Body() createProductDto: CreateProductDto ) {
        return this.productsService.create( createProductDto )
    }

    @Get()
    findAll () {
        return this.productsService.findAll()
    }

    @Get( ':term' )
    findOne ( @Param( 'term' ) term: string ) {
        return this.productsService.findOne( term )
    }

    @Patch( ':id' )
    update ( @Param( 'id' ) id: string, @Body() updateProductDto: UpdateProductDto ) {
        return this.productsService.update( +id, updateProductDto )
    }

    @Delete( ':term' )
    remove ( @Param( 'term' ) term: string ) {
        return this.productsService.remove( term )
    }
}
