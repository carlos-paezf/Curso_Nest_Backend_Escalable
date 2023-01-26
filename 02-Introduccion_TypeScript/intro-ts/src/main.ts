import { bulbasaur } from './bases/04-injection'
import './style.css'


document.querySelector<HTMLDivElement>( '#app' )!.innerHTML = `
    <div>
        <h1>Hello Vite!!!<h1>
        <pre>${ JSON.stringify( await bulbasaur.getMoves(), null, 4 ) }</pre>
    </div>
`