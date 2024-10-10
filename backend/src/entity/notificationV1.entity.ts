import Notification from '../models/notification.model.js';


class NotificationV1 {

    async createNotification(payload: any) {
        const data = await Notification.create(payload);
        return data;
    }
}
const notificationV1 = new NotificationV1();
export default notificationV1;