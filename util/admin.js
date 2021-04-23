/* This file contains the codes required for access to the firebase database of the project
    , it also contains code for iitializing the application*/

// to get access to the database we would need the admin SDK
const admin = require("firebase-admin");

/*Your Firebase service account can be used to authenticate 
multiple Firebase features, such as Database, Storage and
 Auth, programmatically via the unified Admin SDK */
var serviceAccount =
  process.env.NODE_ENV === "production"
    ? require("../gistoracle-28360-firebase-adminsdk-ewftv-9107d0cc69")
    : require("../gistoracle-dev-firebase-adminsdk-4qg56-ce04c6150b.json");

// set environment
const environment = process.env.NODE_ENV;

// intializing the application to use the admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket:
    environment === "production"
      ? process.env.FIREBASE_STORAGE_BUCKET
      : process.env.FIREBASE_DEVELOPMENT_STORAGE_BUCKET,
  databaseURL:
    environment === "production"
      ? process.env.FIREBASE_DATABASE_URL
      : process.env.FIREBASE_DEVELOPMENT_DATABASE_URL,
});

// instantiate the firebase store
const db = admin.firestore();

module.exports = { admin, db };
