import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import axios, { AxiosInstance } from 'axios'
import { Model } from 'mongoose'
import { Pokemon } from 'src/pokemon/entities/pokemon.entity'
import { IPokeResponse } from './interfaces/poke-res.interface'

@Injectable()
export class SeedService {
    private readonly _axios: AxiosInstance = axios

    constructor (
        @InjectModel( Pokemon.name ) private readonly _pokemonModel: Model<Pokemon>
    ) { }

    async populateDB () {
        await this._pokemonModel.deleteMany( {} )

        const { data: { results } } = await this._axios.get<IPokeResponse>( `https://pokeapi.co/api/v2/pokemon?limit=2000` )

        const pokemonToInsert: { name: string, number: number }[] = []

        results.forEach( async ( { name, url } ) => {
            const segments = url.split( '/' )
            const number: number = +segments.at( -2 )
            pokemonToInsert.push( { name, number } )
        } )

        await this._pokemonModel.insertMany( pokemonToInsert )

        return "Seed Executed"
    }
}
