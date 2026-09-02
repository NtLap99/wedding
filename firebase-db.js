/*
 * Firebase Real-time Data Sync for Wedding Invitation
 * Stores & Fetches real RSVP responses and Guest Wishes via Firebase Firestore.
 */

const firebaseConfig = {
  apiKey: "AIzaSyAi-eumzMUOXjeU7A9rtJhCAqhnYuR4D2w",
  authDomain: "wedding-lap-sa.firebaseapp.com",
  projectId: "wedding-lap-sa",
  storageBucket: "wedding-lap-sa.firebasestorage.app",
  messagingSenderId: "781742232516",
  appId: "1:781742232516:web:55fecda0d6e28333db8a91",
  measurementId: "G-Z5N5VWZMFN"
};

let db = null;
let isFirebaseActive = false;
const APP_ID = 'wedding-web';

try {
  if (typeof firebase !== 'undefined') {
    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }
    db = firebase.firestore();
    isFirebaseActive = true;
    console.log("Firebase Firestore initialized successfully.");
  }
} catch (e) {
  console.warn("Firebase initialization notice:", e.message);
}

const WeddingDB = {
  /**
   * Save RSVP response to Firebase Firestore
   */
  async saveRsvp(data) {
    const payload = {
      ...data,
      appId: APP_ID,
      submittedAt: new Date().toISOString(),
      createdAt: typeof firebase !== 'undefined' && firebase.firestore ? firebase.firestore.FieldValue.serverTimestamp() : new Date().toISOString()
    };

    if (isFirebaseActive && db) {
      try {
        await db.collection('rsvps').add(payload);
        console.log("RSVP saved to Firebase successfully:", payload);
      } catch (err) {
        console.error("Error saving RSVP to Firebase:", err);
      }
    }
  },

  /**
   * Add a new guest wish to Firebase Firestore
   */
  async addWish(name, message) {
    const now = new Date();
    const timeString = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} · ${now.getDate()}/${now.getMonth() + 1}`;
    
    const payload = {
      name,
      message,
      appId: APP_ID,
      date: timeString,
      createdAt: typeof firebase !== 'undefined' && firebase.firestore ? firebase.firestore.FieldValue.serverTimestamp() : new Date().toISOString()
    };

    if (isFirebaseActive && db) {
      try {
        await db.collection('wishes').add(payload);
        console.log("Wish saved to Firebase successfully:", payload);
      } catch (err) {
        console.error("Error saving wish to Firebase:", err);
      }
    }
  },

  /**
   * Listen to real-time wishes from Firebase Firestore
   */
  onWishesUpdate(callback) {
    if (isFirebaseActive && db) {
      try {
        return db.collection('wishes')
          .orderBy('createdAt', 'desc')
          .limit(50)
          .onSnapshot((snapshot) => {
            const wishes = [];
            snapshot.forEach((doc) => {
              const data = doc.data();
              if (data.appId !== APP_ID) return;
              wishes.push({
                id: doc.id,
                name: data.name || "Khách mời",
                message: data.message || "",
                date: data.date || "Vừa xong"
              });
            });
            callback(wishes);
          }, (err) => {
            console.warn("Firestore snapshot listener notice:", err);
          });
      } catch (err) {
        console.warn("Could not setup Firestore listener:", err);
      }
    }
    return null;
  }
};
