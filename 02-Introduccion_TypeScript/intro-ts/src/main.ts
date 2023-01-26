import { charmander } from './bases/05-decorators'
import './style.css'



document.querySelector<HTMLDivElement>( '#app' )!.innerHTML = `
    <div>
        <h1>Hello Vite!!!<h1>
        <pre>${ JSON.stringify( charmander, null, 4 ) }</pre>
        <pre>${ charmander.scream() }</pre>
    </div>
`