/* This file contains the firebase config file */

// paste the firebase config file for initialization and authentication.
module.exports = {
  apiKey:
    process.env.GCLOUD_PROJECT === "gistoracle-28360"
      ? process.env.FIREBASE_API_KEY
      : process.env.FIREBASE_DEVELOPMENT_API_KEY,
  authDomain:
    process.env.GCLOUD_PROJECT === "gistoracle-28360"
      ? process.env.FIREBASE_AUTH_DOMAIN
      : process.env.FIREBASE_DEVELOPMENT_AUTH_DOMAIN,
  databaseURL:
    process.env.GCLOUD_PROJECT === "gistoracle-28360"
      ? process.env.FIREBASE_DATABASE_URL
      : process.env.FIREBASE_DEVELOPMENT_DATABASE_URL,
  projectId:
    process.env.GCLOUD_PROJECT === "gistoracle-28360"
      ? process.env.FIREBASE_PROJECT_ID
      : process.env.FIREBASE_DEVELOPMENT_PROJECT_ID,
  storageBucket:
    process.env.GCLOUD_PROJECT === "gistoracle-28360"
      ? process.env.FIREBASE_STORAGE_BUCKET
      : process.env.FIREBASE_DEVELOPMENT_STORAGE_BUCKET,
  messagingSenderId:
    process.env.GCLOUD_PROJECT === "gistoracle-28360"
      ? process.env.FIREBASE_MESSAGING_SENDER_ID
      : process.env.FIREBASE_DEVELOPMENT_MESSAGING_SENDER_ID,
  appId:
    process.env.GCLOUD_PROJECT === "gistoracle-28360"
      ? process.env.FIREBASE_APP_ID
      : process.env.FIREBASE_DEVELOPMENT_APP_ID,
  measurementId:
    process.env.GCLOUD_PROJECT === "gistoracle-28360"
      ? process.env.FIREBASE_MEASUREMENT_ID
      : process.env.FIREBASE_MEASUREMENT_ID,
};
