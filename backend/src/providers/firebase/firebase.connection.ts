import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import { resolve } from "path";

class FirebaseModule {
  private firebaseDb: FirebaseFirestore.Firestore;
  constructor() {
    try {
      admin.initializeApp({
        credential: admin.credential.cert(resolve(process.cwd(), "firebase.json")),
        projectId: 'node-practice-ae3cb'
      })
      console.log("+++++++++++++ Firebase Initialized! +++++++++++++++++++++++++");
    } catch (error) {
      console.log("Firebase admin initialization error >>>>>>>>>>>", error);
      throw error;
    }
    const firebaseDb = getFirestore();
    this.firebaseDb = firebaseDb;
  }

  // async sendPush(registrationTokens: string | string[], notificationData: any, options: any = {}) {
  //   try {
  //     if (!Array.isArray(registrationTokens) || registrationTokens.length <= 0) {
  //       console.log("Invalid registration tokens");
  //       return;
  //     }
  //     const messaging = admin.messaging();
  //     const notificationResult = await messaging.sendToDevice(registrationTokens, notificationData, options);
  //     console.log("notificationData", notificationResult);
  //     console.log(`send notification results ===>`, notificationResult.results);
  //   } catch (error) {
  //     console.error(`We have an error while triggering push => ${error}`);
  //   }
  // }

  async sendPush(registrationToken: string, notificationData: any, options: any = {}) {
    try {
      const messaging = admin.messaging();
      const message = {
        token: registrationToken,
        ...notificationData,
      };
      const response = await admin.messaging().send(message);
      console.log('Successfully sent message:', response);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }
}

const firebaseModule = new FirebaseModule();
export default firebaseModule;