import { Server as SocketIOServer } from 'socket.io';

export class SocketService {
  private io: SocketIOServer | null = null;

  public init(io: SocketIOServer): void {
    this.io = io;
    console.log('[SocketService] Socket.IO instance initialized');
  }

  public emitToPatient(patientId: string, event: string, data: any): void {
    if (this.io) {
      this.io.to(`patient:${patientId}`).emit(event, data);
    }
  }

  public emitToStaff(event: string, data: any): void {
    if (this.io) {
      this.io.to('staff_channel').emit(event, data);
    }
  }

  public broadcast(event: string, data: any): void {
    if (this.io) {
      this.io.emit(event, data);
    }
  }

  public emitToAll(event: string, data: any): void {
    this.broadcast(event, data);
  }
}

export const socketService = new SocketService();
