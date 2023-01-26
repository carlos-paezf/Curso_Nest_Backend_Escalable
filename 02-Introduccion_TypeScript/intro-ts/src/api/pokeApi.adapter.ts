import axios from 'axios'


export class PokeApiFetchAdapter {
    async get<T> ( url: string ): Promise<T> {
        const response = await fetch( url )
        const data: T = await response.json()
        return data
    }
}


export class PokeApiAxiosAdapter {
    private readonly _axios = axios

    async get<T> ( url: string ): Promise<T> {
        const { data } = await this._axios.get<T>( url )
        return data
    }
}