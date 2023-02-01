import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { isValidObjectId, Model } from 'mongoose'
import { CreatePokemonDto } from './dto/create-pokemon.dto'
import { UpdatePokemonDto } from './dto/update-pokemon.dto'
import { Pokemon } from './entities/pokemon.entity'

@Injectable()
export class PokemonService {
    constructor ( @InjectModel( Pokemon.name ) private readonly _pokemonModel: Model<Pokemon> ) { }

    async create ( createPokemonDto: CreatePokemonDto ) {
        createPokemonDto.name = createPokemonDto.name.toLowerCase()
        try {
            const pokemon = await this._pokemonModel.create( createPokemonDto )
            return pokemon
        } catch ( error ) {
            if ( error.code === 11000 )
                throw new BadRequestException( `Pokemon exists in DB ${ JSON.stringify( error.keyValue ) }` )

            console.log( error )
            throw new InternalServerErrorException( `Can't create Pokemon - Check server logs` )
        }
    }

    findAll () {
        return this._pokemonModel.find()
    }

    async findOne ( term: string ) {
        let pokemon: Pokemon
        if ( !isNaN( Number( term ) ) )
            pokemon = await this._pokemonModel.findOne( { number: term } )

        if ( !pokemon && isValidObjectId( term ) )
            pokemon = await this._pokemonModel.findById( term )

        if ( !pokemon )
            pokemon = await this._pokemonModel.findOne( { name: term.toLowerCase().trim() } )

        if ( !pokemon ) throw new NotFoundException( `Pokemon with id, name or number "${ term }" not found` )
        return pokemon
    }

    update ( id: number, updatePokemonDto: UpdatePokemonDto ) {
        return `This action updates a #${ id } pokemon`
    }

    remove ( id: number ) {
        return `This action removes a #${ id } pokemon`
    }
}
