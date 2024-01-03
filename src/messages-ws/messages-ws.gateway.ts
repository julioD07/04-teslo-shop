import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { Server, Socket } from 'socket.io';
import { MessagesWsService } from './messages-ws.service';
import { NewMessageDto } from './dto/new-message.dto';
import { UsePipes, ValidationPipe } from '@nestjs/common';
import { JwtPayload } from '../auth/interfaces';

@WebSocketGateway({ cors: true })
export class MessagesWsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  //? Llamamos al decorador para obtener el servidor de websockets
  @WebSocketServer() wss: Server;

  constructor(
    //? Inyectamos el servicio para poder usarlo
    private readonly messagesWsService: MessagesWsService,

    //? Inyectamos el JWT service para poder usarlo
    private readonly jwtService: JwtService,
  ) {}

  //? Metodo que se ejecuta cuando un cliente se conecta
  async handleConnection(client: Socket) {

    //? Obtenemos el token
    const token = client.handshake.headers['authentication'] as string;
    
    let payload: JwtPayload;
    
    try {
      payload = this.jwtService.verify(token);
       //? Cada vez que un cliente se conecta, se registra en el servicio
      await this.messagesWsService.registerClient(client, payload.id);
    } catch (error) {
      client.disconnect();
      return;
    }

    // //? Conectamos al cliente a una sala
    // client.join('ventas');

    // //? Emitimos un evento al cliente en la sala ventas
    // this.wss.to('ventas').emit('ventaNueva', {});

    //? Cada vez que un cliente se conecta, se emite a todos los clientes conectados
    this.wss.emit(
      'clients-updated',
      this.messagesWsService.getConnectedClients(),
    );
  }

  //? Metodo que se ejecuta cuando un cliente se desconecta
  handleDisconnect(client: Socket) {
    //? Cada vez que un cliente se desconecta, se elimina del servicio
    this.messagesWsService.removeClient(client.id);

    //? Cada vez que un cliente se desconecta, se emite a todos los clientes conectados
    this.wss.emit(
      'clients-updated',
      this.messagesWsService.getConnectedClients(),
    );
  }

  //? message-from-client
  @UsePipes(new ValidationPipe())
  @SubscribeMessage('message-from-client')
  async handleMessageFromClient(client: Socket, payload: NewMessageDto) {
    // //! Notificar unicamente al cliente, no a todos
    // client.emit('message-from-server', {
    //   fullname: 'YO!!',
    //   message: payload.message || "No-message!!"
    // });

    //! Emitir a todos MENOS, al cliente inicial
    // client.broadcast.emit('message-from-server', {
    //   fullname: 'YO!!',
    //   message: payload.message || 'No-message!!',
    // });

    this.wss.emit('message-from-server', {
      fullname: this.messagesWsService.getUserFullName(client.id),
      message: payload.message || 'No-message!!',
    });
  }
}
