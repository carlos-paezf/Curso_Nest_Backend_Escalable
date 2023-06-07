import { OnGatewayConnection, OnGatewayDisconnect, WebSocketGateway } from '@nestjs/websockets';
import { MessagesWsService } from './messages-ws.service';
import { Socket } from 'socket.io';

@WebSocketGateway( { cors: true } )
export class MessagesWsGateway implements OnGatewayConnection, OnGatewayDisconnect {
    constructor ( private readonly messagesWsService: MessagesWsService ) { }

    handleConnection ( client: any ) {
        this.messagesWsService.registerClient( client );

        console.log( { connectedClients: this.messagesWsService.getConnectedClients() } );
    }

    handleDisconnect ( client: Socket ) {
        this.messagesWsService.removeClient( client.id );
    }
}
