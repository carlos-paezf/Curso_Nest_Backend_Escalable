import { Manager, Socket } from 'socket.io-client';


export const connectToServer = () => {
    const manager = new Manager( 'http://localhost:3000/socket.io/socket.io.js' );

    const socket = manager.socket( '/' );

    addListeners( socket );
};


const addListeners = ( socket: Socket ) => {
    const serverStatusSpan = document.querySelector( '#server-status' )!;

    socket.on( 'connect', () => {
        serverStatusSpan.textContent = 'connected';
    } );

    socket.on( 'disconnect', () => {
        serverStatusSpan.textContent = 'disconnected';
    } );
};