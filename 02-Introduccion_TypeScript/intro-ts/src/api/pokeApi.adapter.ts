import axios from 'axios'


export class PokeApiAdapter {
    private readonly _axios = axios

    async get ( url: string ) {
        const { data } = await this._axios.get( url )
        return data
    }
}