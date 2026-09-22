import { Server as SocketIOServer, Socket } from 'socket.io';
import { socketService } from '../services/socketService';
import { setupBridgeHandlers } from './bridgeHandler';

export const setupSocketHandlers = (io: SocketIOServer): void => {
  socketService.init(io);

  io.on('connection', (socket: Socket) => {
    console.log(`[Socket] New client connected: ${socket.id}`);

    // Register HackTracker Office Kit Bridge handlers
    setupBridgeHandlers(io, socket);

    socket.on('join_patient_room', (data: { patientId: string }) => {
      if (data?.patientId) {
        socket.join(`patient:${data.patientId}`);
        console.log(`[Socket] Client ${socket.id} joined room patient:${data.patientId}`);
      }
    });

    socket.on('join_staff_room', (_data: { staffId?: string }) => {
      socket.join('staff_channel');
      console.log(`[Socket] Staff client ${socket.id} joined staff_channel`);
    });

    socket.on('disconnect', () => {
      console.log(`[Socket] Client disconnected: ${socket.id}`);
    });
  });
};
