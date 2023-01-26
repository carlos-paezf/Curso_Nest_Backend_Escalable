import { PokeApiAxiosAdapter, PokeApiFetchAdapter } from '../api/pokeApi.adapter'
import { IPokeAPI, Move } from "../interfaces/pokeapi-response.interface"

export class Pokemon {

    get imageUrl (): string {
        return `https://image/${ this.id }.jpg`
    }

    constructor (
        public readonly id: number,
        public name: string,
        private readonly _http: PokeApiAxiosAdapter
    ) { }


    scream () {
        console.log( `${ this.name.toUpperCase() }!!!` )
    }

    speak () {
        console.log( `${ this.name }, ${ this.name }` )
    }

    async getMoves (): Promise<Move[]> {
        const data = await this._http.get<IPokeAPI>( `https://pokeapi.co/api/v2/pokemon/${ this.id }` )
        const { moves } = data
        return moves
    }
}

const pokeApiAxios = new PokeApiAxiosAdapter()
const pokeApiFetch = new PokeApiFetchAdapter()

// export const bulbasaur = new Pokemon( 1, 'Bulbasaur', pokeApiAxios )
export const bulbasaur = new Pokemon( 1, 'Bulbasaur', pokeApiFetch )