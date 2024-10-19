import Notification from '../models/notification.model.js';


class NotificationV1 {

    async createNotification(payload: any) {
        const data = await Notification.create(payload);
        return data;
    }

    async findDetails(payload: any) {
        const data = await Notification.findOne({_id: payload})
        return data;
    }

    async findAllNotificationsForUser(payload: any) {
        const data = await Notification.find(payload)
        return data;
    }
}
const notificationV1 = new NotificationV1();
export default notificationV1;