/* this file contains code responsible for ensuring authentication of users*/

// require admin and firestore console database
const { admin, db } = require("./admin");

// middleware function for checking to user that user is logged in before performing sensitive operations
module.exports = (req, res, next) => {
  //initialize token
  let idToken;

  // check that headers contain authorization token and it starts with Bearer
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    //assign the token contained in headers
    idToken = req.headers.authorization.split("Bearer ")[1];
  } else {
    console.error("No token found");
    // if token is not found return Unauthorized error message.
    return res.status(403).json({ error: "Unauthorized" });
  }

  // proceed to authentication using the auth function of the admin SDK
  admin
    .auth()
    .verifyIdToken(idToken)
    .then((decodedToken) => {
      req.user = decodedToken;
      return db
        .collection("users")
        .where("userId", "==", req.user.uid)
        .limit(1)
        .get();
    })
    .then((data) => {
      let shrineIds = [];
      let shrines = [];
      let id = data.docs[0].data().userId;

      // get subscribed shrines
      db.collection("shrines")
        .where("users", "array-contains", id)
        .orderBy("latestPostCreation", "desc")
        .get()
        .then((data) => {
          data.forEach((doc) => {
            shrineIds.push(doc.id);
            shrines.push({
              shrineId: doc.id,
              ...doc.data(),
            });
          });
        })
        .catch((err) => console.error(err));

      req.user.username = data.docs[0].data().username;
      req.user.imageUrl = data.docs[0].data().imageUrl;
      req.user.vibrations = data.docs[0].data().vibrations;
      req.user.categories = data.docs[0].data().categories;
      req.user.userId = data.docs[0].data().userId;
      req.user.location = data.docs[0].data().location;
      req.user.shrines = shrineIds;
      req.user.subscribedShrines = shrines;
      req.user.followers = data.docs[0].data().userFollowers;
      req.user.following = data.docs[0].data().userFollowing;
      req.user.email = data.docs[0].data().email;
      req.user.displayName = data.docs[0].data().displayName;

      return db
        .collection("savedPosts")
        .where("username", "==", data.docs[0].data().username)
        .get();
    })
    .then((data) => {
      let posts = [];

      data.forEach((doc) => {
        posts.push({
          ...doc.data(),
        });
      });
      req.user.savedPosts = posts;
      return next();
    })
    .catch((err) => {
      console.error("Error while verifying token ", err);
      return res.status(403).json(err);
    });
};
