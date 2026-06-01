const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

let io = null;
const userSockets = new Map();

const init = (httpServer) => {
    io = new Server(httpServer, {
        cors: { origin: process.env.FRONTEND_URL || '*', methods: ['GET', 'POST'] }
    });

    io.use((socket, next) => {
        const token = socket.handshake.auth?.token;
        if (!token) return next(new Error('Unauthorized'));
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
            socket.user = decoded;
            next();
        } catch {
            next(new Error('Invalid token'));
        }
    });

    io.on('connection', (socket) => {
        const userId = socket.user.id;
        const role = socket.user.role;

        if (!userSockets.has(userId)) userSockets.set(userId, new Set());
        userSockets.get(userId).add(socket.id);

        socket.join(`user:${userId}`);

        if (role === 'vendor') {
            socket.join(`vendor:${userId}`);
            socket.join('vendors');
        }

        console.log(`[Socket] Connected: userId=${userId} role=${role} socketId=${socket.id}`);

        socket.on('disconnect', () => {
            const sockets = userSockets.get(userId);
            if (sockets) {
                sockets.delete(socket.id);
                if (sockets.size === 0) userSockets.delete(userId);
            }
            console.log(`[Socket] Disconnected: userId=${userId} socketId=${socket.id}`);
        });
    });

    return io;
};

const emitToUser = (userId, event, data) => {
    if (!io) return;
    io.to(`user:${userId}`).emit(event, data);
};

const emitToAllVendors = (event, data) => {
    if (!io) return;
    io.to('vendors').emit(event, data);
};

const isUserOnline = (userId) => userSockets.has(Number(userId));

const getIO = () => io;

module.exports = { init, emitToUser, emitToAllVendors, isUserOnline, getIO };