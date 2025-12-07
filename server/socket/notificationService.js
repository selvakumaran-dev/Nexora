import Notification from '../models/Notification.js' // Assuming you have this model or will create it

let ioInstance = null;

export const initNotifications = (io) => {
    ioInstance = io;
    console.log('✅ Notification Service Initialized with Socket.io');
};

export const createNotification = async (userId, data) => {
    try {
        // 1. Save to DB
        const notification = await Notification.create({
            recipient: userId,
            ...data
        });

        // 2. Emit via Socket
        if (ioInstance) {
            ioInstance.to(`user:${userId}`).emit('notification:new', {
                ...notification.toObject(),
                createdAt: notification.createdAt
            });
            console.log(`📨 Notification sent to ${userId}: ${data.title}`);
        } else {
            console.warn('⚠️ Notification Service: Socket.io instance not initialized');
        }
    } catch (error) {
        console.error('❌ Error sending notification:', error);
    }
};

export default {
    initNotifications,
    createNotification
};
