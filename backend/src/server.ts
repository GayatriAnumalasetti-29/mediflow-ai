import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { createApp } from './app';
import { config } from './config';
import { setupSocketHandlers } from './socket';

const startServer = (): void => {
  const app = createApp();
  const httpServer = http.createServer(app);

  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PATCH', 'DELETE']
    }
  });

  setupSocketHandlers(io);

  // Start autonomous appointment monitoring daemon
  const { followUpSchedulerService } = require('./services/followUpSchedulerService');
  followUpSchedulerService.startBackgroundScheduler();

  httpServer.listen(config.port, '0.0.0.0', () => {
    console.log(`=======================================================`);
    console.log(` 🏥 MediFlow AI Backend Running on Port ${config.port}`);
    console.log(` 🌐 Environment: ${config.nodeEnv}`);
    console.log(` 🤖 AI Service Endpoint: ${config.aiServiceUrl}`);
    console.log(` 🔌 Socket.IO Gateway active`);
    console.log(`=======================================================`);
  });
};

startServer();
