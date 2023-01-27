import { Controller, Get, NotFoundException, Param, ParseIntPipe } from '@nestjs/common'
import { CarsService } from './cars.service'


@Controller( 'cars' )
export class CarsController {

    constructor ( private readonly _carsService: CarsService ) { }

    @Get()
    getAllCars () {
        return this._carsService.findAll()
    }

    @Get( ':id' )
    getCarById ( @Param( 'id', ParseIntPipe ) id: number ) {
        const data = this._carsService.findOneById( id )

        if ( !data || !Object.keys( data ).length )
            throw new NotFoundException( `Car with id ${ id } not found` )

        return {
            id,
            data
        }
    }
}
