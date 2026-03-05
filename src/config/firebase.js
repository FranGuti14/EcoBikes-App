import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
apiKey: "AIzaSyBT9-s1haxoXz3up4SYFMzqafPpMNDew_c",
authDomain: "ecobikes-app.firebaseapp.com",
projectId: "ecobikes-app",
storageBucket: "ecobikes-app.firebasestorage.app",
messagingSenderId: "227194301236",
appId: "1:227194301236:web:0d09a415b27ce1a9d21361"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);