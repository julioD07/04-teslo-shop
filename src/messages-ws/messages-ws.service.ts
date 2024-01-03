import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Socket } from 'socket.io';
import { User } from '../auth/entities/user.entity';


interface ConnectedClients {
    [id: string]: {
        socket: Socket,
        user: User 
    }
}

@Injectable()
export class MessagesWsService {

    private connectedClients: ConnectedClients = {};

    constructor(
        //? Inyectamos el repositorio de usuarios
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) { }

    async registerClient(client: Socket, userId: string) {

        const user = await this.userRepository.findOneBy({ id: userId });

        if (!user) throw new Error('User not found');
        if (!user.isActive) throw new Error('User is not active');

        this.checkUserConection(user);

        this.connectedClients[client.id] = {
            socket: client,
            user
        };
    }

    removeClient(cliendId: string) {
        delete this.connectedClients[cliendId];
    }

    getConnectedClients(): string[] {
        return Object.keys(this.connectedClients);
    }

    getUserFullName(clientId: string): string {
        return this.connectedClients[clientId].user.fullName;
    }

    private checkUserConection(user: User) {
        for(const clientId of Object.keys(this.connectedClients)) {
            const connectedClient = this.connectedClients[clientId];

            if (connectedClient.user.id === user.id) {
                connectedClient.socket.disconnect();
                break;
            }
        }
    }
}
