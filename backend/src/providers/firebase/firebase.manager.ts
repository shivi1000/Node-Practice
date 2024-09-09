//import firebaseDb from "./firebase.connection.js";
//import './providers/firebase/firebase.connection.js';

class FirebaseManager {

    async addData(collectionName: string, docId: string, data: any) {
        try {
            // const db = firebaseDb;
            // const response = await db.collection(collectionName).doc(docId).set(data);
            // console.log(" Data added to Firestore >>>>>>>>>", response);
            // return response;
        } catch (error) {
            console.log("Error adding data to Firestore:>>>>>>>>>>>", error);
            throw error;
        }
    }


}

export const firebaseManager = new FirebaseManager();