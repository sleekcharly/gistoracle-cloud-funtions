/* Gist Oracle Firebase functions */
require("dotenv").config();

// require installed firebase-functions package.
const functions = require("firebase-functions");

const algoliasearch = require("algoliasearch");

// require cors
var cors = require("cors");

//require express
const app = require("express")();

//use cors
app.use(cors());

// require the user authentication file
const FBAuth = require("./util/FBAuth");

const {
  getAllPosts,
  getAllPostIds,
  getTotalPostsCount,
  getNextPosts,
  getTailoredUserPost,
  getTailoredUserPostIds,
  getNextTailoredUserPost,
  createPost,
  getPost,
  likePost,
  unlikePost,
  getComment,
  getReplies,
  likeComment,
  unlikeComment,
  commentOnPost,
  commentOnComment,
  deletePost,
  shortenUrl,
  getUserPosts,
  getTopUserPosts,
  getSpicyUserPosts,
  getNextUserPosts,
  savePost,
  unSavePost,
  getUserSavedPosts,
  getNextSavedPosts,
  editPost,
} = require("./handles/posts");

const {
  getAllCategories,
  getCategory,
  getFeaturedNavCategories,
  getMenuNavCategories,
  getmobileMenuNavCategories,
  getAllCategoryPosts,
  getNextCategoryPosts,
  getTop5CatShrines,
} = require("./handles/categories");

const {
  getAllShrines,
  getShrine,
  createShrine,
  getUserSubscribedShrines,
  getAllShrinePosts,
  followShrine,
  unFollowShrine,
  getNextShrinePosts,
  uploadShrineAvatar,
  editShrineDetails,
  changeShrineAvatar,
  top5FollowedShrines,
} = require("./handles/shrines");

const {
  signup,
  login,
  checkPassword,
  uploadImage,
  addUserDetails,
  getAuthenticatedUser,
  getLoggedInUser,
  checkUserExists,
  setProfile,
  getUserDetails,
  sendResetEmail,
  editorUploadImage,
  getUserCredentials,
  getProfileCredentials,
  getConsecratedShrines,
  editProfile,
  checkEmailExists,
  deleteUser,
  setLogin,
  setLogout,
} = require("./handles/users");
const { db, admin } = require("./util/admin");

/* gistoracle posts route */

// fetch all posts from the database
app.get("/posts/:clickedButton", getAllPosts);

// fetch all posts Ids from the database
app.get("/postIds/:clickedButton", getAllPostIds);

// fetch total posts count from database
app.get("/totalPostsCount", getTotalPostsCount);

// fetch next posts for pagination
app.get("/nextPosts/:clickedButton/:parameter", getNextPosts);

// fetch next category posts for pagination
app.get(
  "/nextCategoryPosts/:clickedButton/:parameter/:categoryName",
  getNextCategoryPosts
);

// fetch next shrine posts for pagination on shrine page
app.get(
  "/nextShrinePosts/:clickedButton/:parameter/:shrineName",
  getNextShrinePosts
);

// get tailored user home page posts based on followed categories
app.get("/authUserPosts/:clickedButton", FBAuth, getTailoredUserPost);

// get tailored user home page post Ids based on followed categories
app.get("/authUserPostIds/:clickedButton", FBAuth, getTailoredUserPostIds);

// fetch next tailored user home page posts based on the followed categories
app.get(
  "/nextAuthUserPosts/:clickedButton/:shrineFetchNo",
  FBAuth,
  getNextTailoredUserPost
);

//route for getting user's saved posts
app.get("/user/:username/savedPosts", FBAuth, getUserSavedPosts);

// route for getting user's next saved posts
app.get("/nextSavedPosts/:postsFetchNo", FBAuth, getNextSavedPosts);

//route for getting user posts
app.get("/user/:username/posts", getUserPosts);

// fetch next user posts for pagination
app.get("/nextUserPosts/:clickedButton/:parameter/:username", getNextUserPosts);

// route for getting top liked posts
app.get("/user/:username/posts/top", getTopUserPosts);

// route for getting most commented on posts
app.get("/user/:username/posts/spicy", getSpicyUserPosts);

// route for creating post document
app.post("/post", FBAuth, createPost);

// route for editing post document
app.post("/editPost", FBAuth, editPost);

// route for getting a single post
app.get("/post/:postId", getPost);

// get replies to a  particular comment
app.get("/replies/:commentId", getReplies);

// route for getting a single comment
app.get("/comment/:commentId", getComment);

// route for deleting a post
app.delete("/post/:postId", FBAuth, deletePost);

// route for saving posts
app.get("/save_post/:postId/save", FBAuth, savePost);

// route for unsaving posts
app.get("/save_post/:postId/unsave", FBAuth, unSavePost);

// route for liking posts
app.get("/post/:postId/like", FBAuth, likePost);

// route for unliking posts
app.get("/post/:postId/unlike", FBAuth, unlikePost);

// route for making comments on posts
app.post("/post/:postId/comment", FBAuth, commentOnPost);

// route for making comments on comments
app.post("/comment/:commentId/comment", FBAuth, commentOnComment);

// route for liking comments
app.get("/comment/:commentId/like", FBAuth, likeComment);

// route for unliking comments
app.get("/comment/:commentId/unlike", FBAuth, unlikeComment);

// route for following a shrine
app.get("/shrine/:shrineId/follow", FBAuth, followShrine);

// route for unfollowing a shrine
app.get("/shrine/:shrineId/unfollow", FBAuth, unFollowShrine);

// route for shortening url
//app.get("/shorturl/:currentUrl", shortenUrl);

/*gistoracle categories routes */
// route for getting all categories
app.get("/categories", getAllCategories);

// route for getting al category Posts
app.get("/category/posts/:categoryName/:parameter", getAllCategoryPosts);

//route for getting a category
app.get("/category/:categoryName", getCategory);

// route for getting featured Nav categories
app.get("/featuredNavCategories", getFeaturedNavCategories);

// route for getting the menu categories
app.get("/menuNavCategories", getMenuNavCategories);

// route for getting mobile nav menu categories
app.get("/mobileMenuNavCategories", getmobileMenuNavCategories);

// route for getting the top 5 category shrines
app.get("/topCatShrines/:categoryId", getTop5CatShrines);

/*gistoracle shrines routes */
//route for getting all shrines
app.get("/shrines", getAllShrines);

// route for getting all shrine Posts
app.get("/shrine/posts/:shrineName/:parameter", getAllShrinePosts);

//route for getting a shrine
app.get("/shrine/:shrineName", getShrine);

// fetch all shrines subscribed by the authenticated user
app.get("/userShrines", FBAuth, getUserSubscribedShrines);

// create a new shrine by authenticated user
app.post("/createShrine", FBAuth, createShrine);

// upload shrine avatar
app.post("/shrine/avatar/:shrineName", FBAuth, uploadShrineAvatar);

// edit shrine Details
app.post("/editShrine", FBAuth, editShrineDetails);

// change shrine avatar
app.post("/changeShrineAvatar/:shrineId", FBAuth, changeShrineAvatar);

// get trending shrines
app.get("/topFollowedShrines", top5FollowedShrines);

/* gistoracle user routes */

// signup route
app.post("/signup", signup);

// login route
app.post("/login", login);

// reset password route
app.post("/reset", sendResetEmail);

// check valid password
app.post("/checkPassword/:currentPassword", FBAuth, checkPassword);

// upload image route
app.post("/user/image", FBAuth, uploadImage);

//delete user profile
app.post("/user/delete/:username", FBAuth, deleteUser);

// editor image upload route
app.post("/editor/imageUpload", FBAuth, editorUploadImage);

// update user details route
app.post("/user", FBAuth, addUserDetails);

// edit user profile from settings package
app.post("/editUserProfile/:currentPassword", FBAuth, editProfile);

// get user consecrated shrines route
app.get("/userConsecratedShrines/:username", getConsecratedShrines);

// route for getting an authenticated user
app.get("/user", FBAuth, getAuthenticatedUser);

// route to check if email exists
app.post("/user/emailExists/:email/", checkEmailExists);

// route for getting an logged in user
app.get("/loggedInUser/:uid", getLoggedInUser);

// route for checking for existing user during signup
app.get("/checkExistingUser/:username", checkUserExists);

// setup user profile in database user's collection
app.post("/setUserProfile/:username", setProfile);

// route to get credentials of a user
app.get("/userCredentials/:username", getUserCredentials);

// route to get profile page credentials of a user
app.get("/userPageInfo/:username", getProfileCredentials);

// route for getting details of a user
app.get("/user/:username", getUserDetails);

// route for authentication database metrics
app.get("/setLoggedIn", setLogin);
app.get("/setLoggedOut", setLogout);

// Do this to ensure the route endpoints begin with /g
exports.g = functions.region("europe-west2").https.onRequest(app);

// update all post documets on algolia
// exports.addPostdataToAlgolia = functions.https.onRequest((req, res) => {
//   var arr = [];

//   const ALGOLIA_APP_ID = process.env.ALGOLIA_APP_ID;
//   const ALGOLIA_ADMIN_KEY = process.env.ALGOLIA_API_KEY;
//   const ALGOLIA_INDEX_NAME = "posts";

//   console.log(ALGOLIA_ADMIN_KEY);

//   db.collection("posts")
//     .get()
//     .then((data) => {
//       data.forEach((doc) => {
//         let post = {};
//         post.objectID = doc.id;
//         post.title = doc.data().title;
//         post.slug = doc.data().slug;
//         post.shrineName = doc.data().shrineName;
//         post.categoryName = doc.data().categoryName;
//         post.username = doc.data().username;
//         post.postThumbnail = doc.data().postThumbnail;

//         arr.push(post);
//       });

//       //define client for algolia
//       var client = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_ADMIN_KEY);

//       var index = client.initIndex(ALGOLIA_INDEX_NAME);

//       return index.saveObjects(arr, function (err, content) {
//         console.log(content);
//       });
//     })
//     .catch((err) => {
//       console.error(err);
//     });
// });

/* Section for database triggers on the firestore */

//trigger for updating every associated document to the user image once its updated
exports.onUserImageChange = functions
  .region("europe-west2")
  .firestore.document("/users/{userId}")
  .onUpdate((change) => {
    if (change.before.data().imageUrl !== change.after.data().imageUrl) {
      console.log("Image has changed");
      const batch = db.batch();

      // delet user image from storage bucket
      const userImage = change.before
        .data()
        .imageUrl.match(/[\w-]+\.(jpg|png|gif|jpeg)/g);

      admin.storage().bucket().file(userImage).delete();

      return db
        .collection("comments")
        .where("userImage", "==", change.before.data().imageUrl)
        .get()
        .then((data) => {
          if (data.docs[0]) {
            data.forEach((doc) => {
              const comment = db.doc(`/comments/${doc.id}`);
              batch.update(comment, {
                userImage: change.after.data().imageUrl,
              });
            });
          }
          return db
            .collection("posts")
            .where("userImage", "==", change.before.data().imageUrl)
            .get()
            .then((data) => {
              if (data.docs[0]) {
                data.forEach((doc) => {
                  const post = db.doc(`/posts/${doc.id}`);
                  batch.update(post, {
                    userImage: change.after.data().imageUrl,
                  });
                });
              }
              return db
                .collection("shrines")
                .where("creatorImage", "==", change.before.data().imageUrl)
                .get()
                .then((data) => {
                  if (data.docs[0]) {
                    data.forEach((doc) => {
                      const shrine = db.doc(`/shrines/${doc.id}`);
                      batch.update(shrine, {
                        creatorImage: change.after.data().imageUrl,
                      });
                    });
                  }

                  return batch.commit();
                });
            });
        });
    } else {
      return true;
    }
  });

// trigger for updating every associated document to the user once its updated
exports.onUserNameChange = functions
  .region("europe-west2")
  .firestore.document("users/{userId}")
  .onUpdate((change) => {
    if (change.before.data().username !== change.after.data().username) {
      console.log("username has changed");
      const batch = db.batch();

      return db
        .collection("comments")
        .where("username", "==", change.before.data().username)
        .get()
        .then((data) => {
          if (data.docs[0]) {
            data.forEach((doc) => {
              const comment = db.doc(`/comments/${doc.id}`);
              batch.update(comment, { username: change.after.data().username });
            });
          }
          return db
            .collection("postLikes")
            .where("username", "==", change.before.data().username)
            .get()
            .then((data) => {
              if (data.docs[0]) {
                data.forEach((doc) => {
                  const like = db.doc(`/postLikes/${doc.id}`);
                  batch.update(like, {
                    username: change.after.data().username,
                  });
                });
              }

              return db
                .collection("posts")
                .where("username", "==", change.before.data().username)
                .get()
                .then((data) => {
                  if (data.docs[0]) {
                    data.forEach((doc) => {
                      const post = db.doc(`/posts/${doc.id}`);
                      batch.update(post, {
                        username: change.after.data().username,
                      });
                    });
                  }
                  return db
                    .collection("savedPosts")
                    .where("username", "==", change.before.data().username)
                    .get()
                    .then((data) => {
                      if (data.docs[0]) {
                        data.forEach((doc) => {
                          const savedPost = db.doc(`/savedPosts/${doc.id}`);
                          batch.update(savedPost, {
                            username: change.after.data().username,
                          });
                        });
                      }

                      return db
                        .collection("shrines")
                        .where("creator", "==", change.before.data().username)
                        .get()
                        .then((data) => {
                          if (data.docs[0]) {
                            data.forEach((doc) => {
                              const shrine = db.doc(`/shrines/${doc.id}`);
                              batch.update(shrine, {
                                creator: change.after.data().username,
                              });
                            });
                          }
                          return batch.commit();
                        });
                    });
                });
            });
        });
    } else {
      return true;
    }
  });

//trigger for updating associated documents when a user is deleted
exports.onUserDeleted = functions
  .region("europe-west2")
  .firestore.document("users/{id}")
  .onDelete((snapshot, context) => {
    // get username and userid from deleted user profile
    const username = snapshot.data().username;
    const userId = snapshot.data().userId;

    // batch for batch operations
    const batch = db.batch();

    const admin = require("firebase-admin");

    //perform filtering and update operations
    // for comment Likes
    return db
      .collection("commentLikes")
      .where("username", "==", username)
      .get()
      .then((data) => {
        //delete comment docs that match username
        if (data.docs[0]) {
          data.forEach((doc) => {
            batch.delete(db.doc(`/commentLikes/${doc.id}`));
          });
        }

        // for postLikes
        return db
          .collection("postLikes")
          .where("username", "==", username)
          .get()
          .then((data) => {
            // delete postlikes docs that match username
            if (data.docs[0]) {
              data.forEach((doc) => {
                batch.delete(db.doc(`/postLikes/${doc.id}`));
              });
            }

            // for saved posts
            return db
              .collection("savedPosts")
              .where("username", "==", username)
              .get()
              .then((data) => {
                //delete saved posts that match
                if (data.docs[0]) {
                  data.forEach((doc) => {
                    batch.delete(db.doc(`/savedPosts/${doc.id}`));
                  });
                }

                // for shrine follows
                return db
                  .collection("shrineFollows")
                  .where("userId", "==", userId)
                  .get()
                  .then((data) => {
                    // delete if that match userId
                    if (data.docs[0]) {
                      data.forEach((doc) => {
                        batch.delete(db.doc(`/shrineFollows/${doc.id}`));
                      });
                    }

                    // for shrine collection users array
                    return db
                      .collection("shrines")
                      .where("users", "array-contains", userId)
                      .get()
                      .then((data) => {
                        if (data.docs[0]) {
                          data.forEach((doc) => {
                            batch.update(db.doc(`/shrines/${doc.id}`), {
                              users: admin.firestore.FieldValue.arrayRemove(
                                userId
                              ),
                              followers: admin.firestore.FieldValue.increment(
                                -1
                              ),
                            });
                          });
                        }

                        // get reference to deleted users archive collection
                        const archRef = db
                          .collection("deletedUsersArchive")
                          .doc(userId);

                        // set document
                        batch.set(archRef, {
                          userId: userId,
                          about: snapshot.data().about,
                          username: snapshot.data().username,
                          createdAt: snapshot.data().createdAt,
                          displayName: snapshot.data().displayName
                            ? snapshot.data().displayName
                            : "",
                          email: snapshot.data().email,
                          imageUrl: snapshot.data().imageUrl,
                          location: snapshot.data().location
                            ? snapshot.data().location
                            : {},
                          postCount: snapshot.data().postCount,
                          vibrations: snapshot.data().vibrations,
                          email: snapshot.data().email,
                          deletedAt: new Date().toISOString(),
                        });

                        // appmetrics update
                        const appMetricsRef = db
                          .collection("appMetrics")
                          .doc("stats");
                        batch.update(appMetricsRef, {
                          registeredUsers: admin.firestore.FieldValue.increment(
                            -1
                          ),
                          loggedIn: admin.firestore.FieldValue.increment(-1),
                        });

                        // commit
                        return batch.commit();
                      });
                  })
                  .catch((err) => {
                    console.error(err);
                  });
              })
              .catch((err) => {
                console.error(err);
              });
          })
          .catch((err) => {
            console.error(err);
          });
      })
      .catch((err) => {
        console.error(err);
      });
  });

// trigger for updating shrines collection with id of newly created user
exports.onUserCreated = functions
  .region("europe-west2")
  .firestore.document("users/{id}")
  .onCreate((snapshot, context) => {
    const batch = db.batch();
    const admin = require("firebase-admin");

    // populate pinned shrines with new user id
    // shrine 1
    const shrine1Ref = db.collection("shrines").doc("t4TYS8lU7EPPrvWGsVT7");
    batch.update(shrine1Ref, {
      users: admin.firestore.FieldValue.arrayUnion(snapshot.data().userId),
      followers: admin.firestore.FieldValue.increment(1),
    });

    //shrine2
    const shrine2Ref = db.collection("shrines").doc("x8D6pc6vIk1ozRG73XRX");
    batch.update(shrine2Ref, {
      users: admin.firestore.FieldValue.arrayUnion(snapshot.data().userId),
      followers: admin.firestore.FieldValue.increment(1),
    });

    //shrine3
    const shrine3Ref = db.collection("shrines").doc("Qd5qTeyQ5yCnYePz9HYs");
    batch.update(shrine3Ref, {
      users: admin.firestore.FieldValue.arrayUnion(snapshot.data().userId),
      followers: admin.firestore.FieldValue.increment(1),
    });

    //shrine 4
    const shrine4Ref = db.collection("shrines").doc("G4zn8pWomBTFfpT9pDSk");
    batch.update(shrine4Ref, {
      users: admin.firestore.FieldValue.arrayUnion(snapshot.data().userId),
      followers: admin.firestore.FieldValue.increment(1),
    });

    //shrine 5
    const shrine5Ref = db.collection("shrines").doc("1c8FiHmEDDMl1qqoZhDO");
    batch.update(shrine5Ref, {
      users: admin.firestore.FieldValue.arrayUnion(snapshot.data().userId),
      followers: admin.firestore.FieldValue.increment(1),
    });

    //shrine 6
    const shrine6Ref = db.collection("shrines").doc("LZYPJnYiuBg3plJ2XK88");
    batch.update(shrine6Ref, {
      users: admin.firestore.FieldValue.arrayUnion(snapshot.data().userId),
      followers: admin.firestore.FieldValue.increment(1),
    });

    //shrine 7
    const shrine7Ref = db.collection("shrines").doc("eeGKpTw993mDLk9CZQU5");
    batch.update(shrine7Ref, {
      users: admin.firestore.FieldValue.arrayUnion(snapshot.data().userId),
      followers: admin.firestore.FieldValue.increment(1),
    });

    //shrine 5
    const shrine8Ref = db.collection("shrines").doc("NxxBIaM4NW5VKjzGuVIC");
    batch.update(shrine8Ref, {
      users: admin.firestore.FieldValue.arrayUnion(snapshot.data().userId),
      followers: admin.firestore.FieldValue.increment(1),
    });

    // appmetrics update
    const appMetricsRef = db.collection("appMetrics").doc("stats");
    batch.update(appMetricsRef, {
      registeredUsers: admin.firestore.FieldValue.increment(1),
      loggedIn: admin.firestore.FieldValue.increment(1),
    });

    // commit batch update to firebase
    return batch.commit();
  });

// trigger for updated post
exports.onPostUpdated = functions
  .region("europe-west2")
  .firestore.document("posts/{id}")
  .onUpdate((change) => {
    if (change.bafore.data().title !== change.after.data().title) {
      console.log("post has changed");

      //define client for algolia
      const client = algoliasearch(
        process.env.ALGOLIA_APP_ID,
        process.env.ALGOLIA_API_KEY
      );

      // define post object
      const post = {};

      // get the post document's data
      post.title = change.after.data().title;
      post.slug = change.after.data().slug;
      post.shrineName = change.after.data().shrineName;
      post.postThumbnail = change.after.data().postThumbnail;

      // add objectId field required by Algolia
      post.objectID = change.after.id;

      // write algolia index
      const index = client.initIndex(process.env.ALGOLIA_INDEX_NAME);

      // save algolia object;
      index
        .saveObject(post)
        .then(() => {
          console.log("Post Data updated to Algolia", objectID);
        })
        .catch((error) => {
          console.error("Error when updating post data to Algolia", error);
          process.exit(1);
        });
    }
  });

//trigger for ading and updating every associated document to the post once its created(likes, comments, post counts, saved posts)
exports.onPostCreated = functions
  .region("europe-west2")
  .firestore.document("posts/{id}")
  .onCreate((snapshot, context) => {
    const batch = db.batch();
    const admin = require("firebase-admin");

    //define client for algolia
    const client = algoliasearch(
      process.env.ALGOLIA_APP_ID,
      process.env.ALGOLIA_API_KEY
    );

    // define post object
    const post = {};

    // get the post document's data
    post.title = snapshot.data().title;
    post.slug = snapshot.data().slug;
    post.shrineName = snapshot.data().shrineName;
    post.categoryName = snapshot.data().categoryName;
    post.username = snapshot.data().username;
    post.postThumbnail = snapshot.data().postThumbnail;

    // add objectId field required by Algolia
    post.objectID = snapshot.id;

    // write algolia index
    const index = client.initIndex(process.env.ALGOLIA_INDEX_NAME);

    // save algolia object;
    index
      .saveObject(post)
      .then(() => {
        console.log("Post Data added to Algolia", objectID);
      })
      .catch((error) => {
        console.error("Error when adding post data to Algolia", error);
        process.exit(1);
      });

    // update postMetrics collection
    const postMetricsRef = db.doc(`/postsMetrics/count`);
    batch.update(postMetricsRef, {
      total: admin.firestore.FieldValue.increment(1),
    });

    //  users collection update
    const userRef = db.doc(`/users/${snapshot.data().username}`);
    batch.update(userRef, {
      postCount: admin.firestore.FieldValue.increment(1),
      vibrations: admin.firestore.FieldValue.increment(0.25),
    });

    // category collections update
    const categoryRef = db.doc(`/category/${snapshot.data().categoryId}`);
    batch.update(categoryRef, {
      posts: admin.firestore.FieldValue.increment(1),
    });

    // shrine collections update
    const shrineRef = db.doc(`/shrines/${snapshot.data().shrineId}`);
    batch.update(shrineRef, {
      posts: admin.firestore.FieldValue.increment(1),
    });

    return batch.commit();
  });

//trigger for deleting and updating every associated document to the post once its deleted(likes, comments, post counts, saved posts)
exports.onPostDeleted = functions
  .region("europe-west2")
  .firestore.document("posts/{id}")
  .onDelete((snapshot, context) => {
    const postId = snapshot.data().postId;
    const batch = db.batch();
    const admin = require("firebase-admin");

    //define client for algolia
    const client = algoliasearch(
      process.env.ALGOLIA_APP_ID,
      process.env.ALGOLIA_API_KEY
    );

    // add objectId field required by Algolia
    const objectID = snapshot.id;

    // write algolia index
    const index = client.initIndex(process.env.ALGOLIA_INDEX_NAME);

    // save algolia object;
    index
      .deleteObject(objectID)
      .then(() => {
        console.log("Post deleted from Algolia", objectID);
      })
      .catch((error) => {
        console.error("Error when deleting post from Algolia", error);
        process.exit(1);
      });

    return db
      .collection("postLikes")
      .where("postId", "==", postId)
      .get()
      .then((data) => {
        if (data.docs[0]) {
          data.forEach((doc) => {
            batch.delete(db.doc(`/postLikes/${doc.id}`));
          });
        }
        return db
          .collection("comments")
          .where("postId", "==", postId)
          .get()
          .then((data) => {
            if (data.docs[0]) {
              data.forEach((doc) => {
                batch.delete(db.doc(`/comments/${doc.id}`));
              });
            }

            return db
              .collection("savedPosts")
              .where("postId", "==", postId)
              .get()
              .then((data) => {
                if (data.docs[0]) {
                  data.forEach((doc) => {
                    batch.delete(db.doc(`/savedPosts/${doc.id}`));
                  });
                }

                const archRef = db.collection("archive").doc(postId);
                batch.set(archRef, {
                  postId: postId,
                  commentCount: snapshot.data().commentCount,
                  userImage: snapshot.data().userImage,
                  createdAt: snapshot.data().createdAt,
                  likes: snapshot.data().likes,
                  categoryName: snapshot.data().categoryName,
                  shrineId: snapshot.data().shrineId,
                  location: snapshot.data().location,
                  postThumbnail: snapshot.data().postThumbnail,
                  categoryId: snapshot.data().categoryId,
                  title: snapshot.data().title,
                  body: snapshot.data().body,
                  slug: snapshot.data().slug,
                  shrineName: snapshot.data().shrineName,
                  username: snapshot.data().username,
                  deletedAt: new Date().toISOString(),
                });

                // shrine collection update
                const shrineRef = db.doc(
                  `/shrines/${snapshot.data().shrineId}`
                );
                batch.update(shrineRef, {
                  postIds: admin.firestore.FieldValue.arrayRemove(postId),
                  posts: admin.firestore.FieldValue.increment(-1),
                });

                return db
                  .collection("users")
                  .where("username", "==", snapshot.data().username)
                  .limit(1)
                  .get();
              })
              .then((data) => {
                let userId = [];
                data.forEach((doc) => {
                  userId.push(doc.id);
                });

                // update postMetrics collection
                const postMetricsRef = db.doc(`/postsMetrics/count`);
                batch.update(postMetricsRef, {
                  total: admin.firestore.FieldValue.increment(-1),
                });

                // update users collection
                const userRef = db.doc(`/users/${userId[0]}`);
                batch.update(userRef, {
                  postCount: admin.firestore.FieldValue.increment(-1),
                  vibrations: admin.firestore.FieldValue.increment(-0.25),
                });

                // update category collection
                const categoryRef = db.doc(
                  `/category/${snapshot.data().categoryId}`
                );
                batch.update(categoryRef, {
                  posts: admin.firestore.FieldValue.increment(-1),
                });

                return batch.commit();
              })
              .catch((err) => {
                console.error(err);
              });
          })
          .catch((err) => {
            console.error(err);
          });
      })
      .catch((err) => {
        console.error(err);
      });
  });

// trigger for updating shrine followership and users field once shrine is created
exports.onShrineCreated = functions
  .region("europe-west2")
  .firestore.document("shrines/{id}")
  .onCreate((snapshot, context) => {
    const admin = require("firebase-admin");
    const batch = db.batch();

    return db
      .collection("users")
      .where("username", "==", snapshot.data().creator)
      .limit(1)
      .get()
      .then((data) => {
        let userData = [];
        let userId = [];
        data.forEach((doc) => {
          userData.push(doc.data());
          userId.push(doc.id);
        });

        // shrine collection update
        const shrineRef = db.doc(`/shrines/${snapshot.id}`);
        batch.update(shrineRef, {
          users: admin.firestore.FieldValue.arrayUnion(userData[0].userId),
          followers: admin.firestore.FieldValue.increment(1),
        });

        // user collection update
        const userRef = db.doc(`/users/${userId[0]}`);
        batch.update(userRef, {
          vibrations: admin.firestore.FieldValue.increment(0.5),
          shrines: admin.firestore.FieldValue.arrayUnion(snapshot.id),
        });

        // category collection update
        const categoryRef = db.doc(`/category/${snapshot.data().categoryId}`);
        batch.update(categoryRef, {
          shrines: admin.firestore.FieldValue.increment(1),
        });

        // appmetrics update
        const appMetricsRef = db.collection("appMetrics").doc("stats");
        batch.update(appMetricsRef, {
          totalShrines: admin.firestore.FieldValue.increment(1),
        });

        return db
          .collection("shrineFollows")
          .add({ shrineId: snapshot.id, userId: userData[0].userId });
      })
      .then(() => {
        return batch.commit();
      })
      .catch((err) => {
        console.error(err);
      });
  });

// trigger for updating followership and users field once shrine is deleted
exports.onShrineDeleted = functions
  .region("europe-west2")
  .firestore.document("shrines/{id}")
  .onDelete((snapshot, context) => {
    const admin = require("firebase-admin");
    const batch = db.batch();

    return db
      .collection("users")
      .where("username", "==", snapshot.data().creator)
      .limit(1)
      .get()
      .then((data) => {
        let userId = [];
        data.forEach((doc) => {
          userId.push(doc.id);
        });

        // user collection update
        const userRef = db.doc(`/users/${userId[0]}`);
        batch.update(userRef, {
          vibrations: admin.firestore.FieldValue.increment(-0.5),
          shrines: admin.firestore.FieldValue.arrayRemove(snapshot.id),
        });

        // category collection update
        const categoryRef = db.doc(`/category/${snapshot.data().categoryId}`);
        batch.update(categoryRef, {
          shrines: admin.firestore.FieldValue.increment(-1),
        });

        // appmetrics update
        const appMetricsRef = db.collection("appMetrics").doc("stats");
        batch.update(appMetricsRef, {
          totalShrines: admin.firestore.FieldValue.increment(-1),
        });

        return db
          .collection("shrineFollows")
          .where("shrineId", "==", snapshot.id)
          .get()
          .then((data) => {
            data.forEach((doc) => {
              batch.delete(db.doc(`/shrineFollows/${doc.id}`));
            });
          });
      })
      .then(() => {
        batch.commit();
      })
      .catch((err) => {
        console.error(err);
      });
  });

// trigger for deleting shrine avatar from storage once shrine is edited
exports.deleteShrineAvatarOnshrineUpdate = functions
  .region("europe-west2")
  .firestore.document("/shrines/{shrineId}")
  .onUpdate((change, context) => {
    if (
      change.before.data().avatar !== "" &&
      change.before.data().avatar !== change.after.data().avatar
    ) {
      const avatarFile = change.before
        .data()
        .avatar.match(/[\w-]+\.(jpg|png|gif|jpeg)/g);

      admin.storage().bucket().file(avatarFile).delete();
    }
  });

// trigger for deleting post thumbnail if post thumbnail is updated
exports.deletePostThumbnailOnPostUpdate = functions
  .region("europe-west2")
  .firestore.document("/posts/{postId}")
  .onUpdate((change, context) => {
    if (
      change.before.data().postThumbnail !== change.after.data().postThumbnail
    ) {
      const thumbnailFile = change.before
        .data()
        .postThumbnail.match(/[\w-]+\.(jpg|png|gif|jpeg)/g);

      admin.storage().bucket().file(thumbnailFile).delete();
    }
  });
