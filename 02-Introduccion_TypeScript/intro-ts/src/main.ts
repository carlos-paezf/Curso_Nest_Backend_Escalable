import { setupCounter } from './counter'
import './style.css'

import { age, name } from './bases/01-types'


document.querySelector<HTMLDivElement>( '#app' )!.innerHTML = `
    <div>
        <h1>Hello ${ name }<h1>
        <h1>Age: <code>${ age }</code></h1>
    </div>
`


setupCounter( document.querySelector<HTMLButtonElement>( '#counter' )! )
