import { Body, Controller, Delete, Get, NotFoundException, Param, ParseIntPipe, Patch, Post } from '@nestjs/common'
import { CarsService } from './cars.service'


@Controller( 'cars' )
export class CarsController {

    constructor ( private readonly _carsService: CarsService ) { }

    @Get()
    getAllCars () {
        return this._carsService.findAll()
    }

    @Get( ':id' )
    getCarById ( @Param( 'id' ) id: string ) {
        const data = this._carsService.findOneById( id )

        if ( !data || !Object.keys( data ).length )
            throw new NotFoundException( `Car with id ${ id } not found` )

        return {
            id,
            data
        }
    }

    @Post()
    createCar ( @Body() body: any ) {
        return {
            ok: true,
            method: 'POST',
            body
        }
    }

    @Patch( ':id' )
    updateCar ( @Param( 'id' ) id: string, @Body() body: any ) {
        return {
            ok: true,
            method: 'PATCH',
            id, body
        }
    }

    @Delete( ':id' )
    deleteCar ( @Param( 'id' ) id: string ) {
        return {
            ok: true,
            method: 'DELETE',
            id
        }
    }
}
