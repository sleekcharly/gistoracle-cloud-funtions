/* This file contains the codes required for access to the firebase database of the project
    , it also contains code for iitializing the application*/

// to get access to the database we would need the admin SDK
const admin = require("firebase-admin");

/*Your Firebase service account can be used to authenticate 
multiple Firebase features, such as Database, Storage and
 Auth, programmatically via the unified Admin SDK */
var serviceAccount = require("../gistoracle-28360-firebase-adminsdk-ewftv-9107d0cc69");

// intializing the application to use the admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  databaseURL: process.env.FIREBASE_DATABASE_URL,
});

// instantiate the firebase store
const db = admin.firestore();

module.exports = { admin, db };
