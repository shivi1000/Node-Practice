import admin from 'firebase-admin';
import { getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { resolve } from "path";

class FirebaseModule {
  constructor() {
    try {
      //if (!getApps().length) {
      admin.initializeApp({
        credential: admin.credential.cert(resolve(process.cwd(), "firebase.json")),
      })
      //}
      console.log("+++++++++++++ Firebase Initialized! +++++++++++++++++++++++++");
    } catch (error) {
      console.log("Firebase admin initialization error >>>>>>>>>>>", error);
      throw error;
    }
    const firebaseDb = getFirestore();
    return firebaseDb;
  }
}

const firebaseModule = new FirebaseModule();
export default firebaseModule



