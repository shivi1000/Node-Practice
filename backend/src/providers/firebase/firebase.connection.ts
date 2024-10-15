import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import { resolve } from "path";

class FirebaseModule {
  /**
   * Constructor for the FirebaseModule class.
   * Initializes the Firebase Admin SDK and connects to
   * the Firestore database.
   * @returns {FirebaseFirestore} The Firestore database instance.
   */
  constructor() {
    try {
      // Initialize the Firebase Admin SDK
      admin.initializeApp({
        credential: admin.credential.cert(resolve(process.cwd(), "firebase.json")),
      });
      console.log("+++++++++++++ Firebase Initialized! +++++++++++++++++++++++++");
    } catch (error) {
      // Handle the error if the initialization fails
      console.log("Firebase admin initialization error >>>>>>>>>>>", error);
      throw error;
    }
    // Get the Firestore database instance
    const firebaseDb = getFirestore();
    return firebaseDb;
  }
}

const firebaseModule = new FirebaseModule();
export default firebaseModule



