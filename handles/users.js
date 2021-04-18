/* This file contains codes for user sign up and authentications*/

// require thhe admin and db codes from the admin.js file
const { admin, db } = require("../util/admin");

// require the config files
const config = require("../util/config");

// require firebase and initialize the firebase app console using the config file
const firebase = require("firebase");
firebase.initializeApp(config);

// bring in sharp for image resizing
const sharp = require("sharp");

// require the codes necessary for validation
const {
  validateSignupData,
  validateLoginData,
  validateUserProfileData,
  reduceUserDetails,
} = require("../util/validator");

// callback function for reseting user email
exports.sendResetEmail = (req, res) => {
  // define status object
  let status = {};

  // assign user email from form
  const user = {
    email: req.body.email,
  };

  // validate data using signup validator
  const { valid, errors } = validateLoginData(user);

  if (!valid) return res.status(400).json(errors);

  // after successful validation
  let userRef = db.collection("users").where("email", "==", user.email);

  userRef
    .get()

    .then((snapshot) => {
      // check to see if email already exists
      if (snapshot.empty) {
        console.log("not found");
        return res.status(400).json({ email: "email does not exist" });
      } else {
        // if email exists send reset email
        return firebase
          .auth()
          .sendPasswordResetEmail(user.email)
          .then(() => {
            res.json({ message: "link sent to email" });
          });
      }
    })
    .catch((err) => {
      console.error(err);

      return res
        .status(500)
        .json({ general: "Something went wrong, please try again" });
    });
};

// callback function for signup route
exports.signup = (req, res) => {
  const newUser = {
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    username: req.body.username,
    location: req.body.location,
  };

  const { valid, errors } = validateSignupData(newUser);

  if (!valid) return res.status(400).json(errors);

  const noImg = "no-image.png";

  let token, userId;

  // After successful validation
  return (
    db
      .collection("users")
      .where("username", "==", newUser.username)
      .limit(1)
      .get()
      .then((data) => {
        // check to see if username already exists
        if (data) {
          return res
            .status(400)
            .json({ username: "this username is already taken" });
        } else {
          // if username does not exists create new user profile
          return firebase
            .auth()
            .createUserWithEmailAndPassword(newUser.email, newUser.password);
        }
      })
      // get and store user ID in variable
      .then((data) => {
        userId = data.user.uid;

        // retrieve and return user IdToken for logged in user check
        return data.user.getIdToken();
      })
      .then((idToken) => {
        token = idToken;
        const userCredentials = {
          username: newUser.username,
          email: newUser.email,
          createdAt: new Date().toISOString(),
          imageUrl: `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${noImg}?alt=media`,
          userId,
          about: "",
          displayName: "",
          savedPosts: 0,
          postCount: 0,
          location: newUser.location,
          vibrations: 1,
          shrines: [
            "NFv3EJNma7h3KUmi7hst",
            "ejFUeub9lCz1SsWlADnM",
            "yfTr2HLSaXbTSQATg5eQ",
            "Dr6WutLkRVYigHiIweaJ",
            "B8sGI2bcioXOsWuYRl3q",
          ],
          userFollowers: [],
          userFollowing: [],
        };

        db.doc(`/users/${newUser.username}`).set(userCredentials);

        return userCredentials;
      })
      .then((data) => {
        // update the shrines collection users array field in firebase.
        async function updateDocumentArray(db) {
          const admin = require("firebase-admin");

          //shrine NFv3EJNma7h3KUmi7hst ref
          const shrine1Ref = db
            .collection("shrines")
            .doc("NFv3EJNma7h3KUmi7hst");
          const union1Res = await shrine1Ref.update({
            users: admin.firestore.FieldValue.arrayUnion(data.userId),
          });

          //shrine ejFUeub9lCz1SsWlADnM ref
          const shrine2Ref = db
            .collection("shrines")
            .doc("ejFUeub9lCz1SsWlADnM");
          const union2Res = await shrine2Ref.update({
            users: admin.firestore.FieldValue.arrayUnion(data.userId),
          });

          //shrine yfTr2HLSaXbTSQATg5eQ ref
          const shrine3Ref = db
            .collection("shrines")
            .doc("yfTr2HLSaXbTSQATg5eQ");
          const union3Res = await shrine3Ref.update({
            users: admin.firestore.FieldValue.arrayUnion(data.userId),
          });

          //shrine Dr6WutLkRVYigHiIweaJ ref
          const shrine4Ref = db
            .collection("shrines")
            .doc("Dr6WutLkRVYigHiIweaJ");
          const union4Res = await shrine4Ref.update({
            users: admin.firestore.FieldValue.arrayUnion(data.userId),
          });

          //shrine B8sGI2bcioXOsWuYRl3q ref
          const shrine5Ref = db
            .collection("shrines")
            .doc("B8sGI2bcioXOsWuYRl3q");
          const union5Res = await shrine5Ref.update({
            users: admin.firestore.FieldValue.arrayUnion(data.userId),
          });

          union1Res;
          union2Res;
          union3Res;
          union4Res;
          union5Res;
        }

        updateDocumentArray(db);
      })
      .then(() => {
        return res.status(201).json({ token });
      })
      .catch((err) => {
        console.error(err);
        if (err.code === "auth/email-already-in-use") {
          return res.status(400).json({ email: "Email is already in use " });
        } else {
          return res
            .status(500)
            .json({ general: "Something went wrong, please try again" });
        }
      })
  );
};

// callback function for deleting user document
exports.deleteUser = (req, res) => {
  //get user uid for deletion
  const userId = [];
  console.log(req.params.username);

  return db
    .collection("users")
    .where("username", "==", req.params.username)
    .limit(1)
    .get()
    .then((data) => {
      //get user id
      data.forEach((doc) => {
        userId.push(doc.id);
      });

      console.log(userId);

      //delete user profile in database
      db.doc(`/users/${userId[0]}`)
        .delete()
        .then(() => {
          console.log("User profile deleted");
          res.status(200).json("User profile deleted");
        })
        .catch((err) => {
          console.error(err);

          return res.status(500).json(err);
        });
    })
    .catch((err) => {
      console.error(err);

      return res.status(500).json("server error");
    });
};

// callback function for checking existing users
exports.checkUserExists = (req, res) => {
  return db
    .collection("users")
    .where("username", "==", req.params.username)
    .limit(1)
    .get()
    .then((data) => {
      if (data.docs[0]) {
        return res
          .status(400)
          .json({ username: "This username is already taken" });
      } else {
        return res.json("User does not exist");
      }
    })
    .catch((err) => {
      console.error(err);
    });
};

//callback for setting user profile in firestore database
exports.setProfile = (req, res) => {
  // extract user credentials
  let credentials = req.body;
  console.log(credentials);

  db.doc(`/users/${credentials.username}`)
    .set(credentials)
    .then(() => {
      console.log("profile created successfully");
      return res.status(200).json("profile created successfully");
    })
    .catch((err) => {
      return res.status(500).json(err);
    });
};

// callback function for login route
exports.login = (req, res) => {
  const user = {
    email: req.body.email,
    password: req.body.password,
  };

  // check for validation errors
  const { valid, errors } = validateLoginData(user);

  if (!valid) return res.status(400).json(errors);

  // after successful validation of input data
  firebase
    .auth()
    .signInWithEmailAndPassword(user.email, user.password)
    .then((data) => {
      return data.user.getIdToken(); // get user id token
    })
    .then((token) => {
      return res.json({ token });
    })
    .catch((err) => {
      console.error(err);

      return res
        .status(403)
        .json({ general: "Wrong email or password! please try again" });
    });
};

// callbacks for updating login information
exports.setLogin = (req, res) => {
  const appMetrics = db.collection("appMetrics").doc("stats");

  return appMetrics.update({
    loggedIn: admin.firestore.FieldValue.increment(1),
  });
};

exports.setLogout = (req, res) => {
  const appMetrics = db.collection("appMetrics").doc("stats");

  return appMetrics.update({
    loggedIn: admin.firestore.FieldValue.increment(-1),
  });
};
// end of updating login information callbacks

// callback function for checking valid password
exports.checkPassword = async (req, res) => {
  // set credentials
  var user = firebase.auth().currentUser;
  var credential = firebase.auth.EmailAuthProvider.credential(
    req.user.email,
    req.params.currentPassword
  );

  if (user) {
    await user
      .reauthenticateWithCredential(credential)
      .then(() => {
        console.log(user);
        return res.json({
          passwordSuccess: "password is authentic and user reauthenticated",
        });
      })
      .catch((err) => {
        console.error(err);
        return res
          .status(403)
          .json({ error: "Wrong password! Please try again" });
      });
  } else {
    console.log("not signed in");
  }
};

// callback to check if email exists in database
exports.checkEmailExists = (req, res) => {
  console.log(req.params.email);
  return db
    .collection("users")
    .where("email", "==", req.params.email)
    .limit(1)
    .get()
    .then((data) => {
      // check to see if email is already attached to an existing user
      if (data.docs[0]) {
        console.log(data.docs[0]);
        return res
          .status(400)
          .json({ email: "This email is already attached to a user" });
      } else {
        return res.json({ email: "No user exists with this email" });
      }
    });
};

//callback for editing user profile from  client settings page
exports.editProfile = (req, res) => {
  const userDetails = {
    email: req.body.email,
    username: req.body.username,
    displayName: req.body.displayName,
    about: req.body.about,
  };

  //container for filtered new user Details not existing in database
  let newUserDetails = {};

  // define userId array container
  let userId = [];

  // check for validation errors
  const { valid, errors } = validateUserProfileData(userDetails);

  if (!valid) return res.status(400).json(errors);

  {
    /*this follows after successful validation */
  }
  // run check to see if new username already exists
  if (userDetails.username !== req.user.username) {
    db.collection("users")
      .where("username", "==", userDetails.username)
      .limit(1)
      .get()
      .then((data) => {
        // check to see if username already exists
        if (data.docs[0]) {
          return res
            .status(400)
            .json({ username: "This username is already taken" });
        }
        newUserDetails.username = userDetails.username;
      })
      .catch((err) => {
        console.error(err);
      });
  }

  // perform user profile update on database
  return db
    .collection("users")
    .where("username", "==", req.user.username)
    .limit(1)
    .get()
    .then((data) => {
      let userData = {};
      data.forEach((doc) => {
        userId.push(doc.id);
      });

      // update userdetails in database
      newUserDetails.displayName = userDetails.displayName;
      newUserDetails.about = userDetails.about;
      newUserDetails.email = userDetails.email;

      db.doc(`/users/${userId[0]}`)
        .update(newUserDetails)
        .then(() => {
          console.log("User data updated successfully");
          return res
            .status(200)
            .json({ updateSuccess: "User data updated successfully" });
        })
        .catch((err) => {
          console.error(err);
          return res
            .status(500)
            .json({ general: "Error from server, try again in a few moment" });
        });
    })
    .catch((err) => {
      console.error(err);
      return res
        .status(500)
        .json({ general: "Server erorr, could not update profile" });
    });
};

// callback function for adding or editing user profile details
exports.addUserDetails = (req, res) => {
  let userDetails = reduceUserDetails(req.body);

  let userId = [];

  return db
    .collection("users")
    .where("username", "==", req.user.username)
    .limit(1)
    .get()
    .then((data) => {
      data.forEach((doc) => {
        userId.push(doc.id);
      });

      // update userdetails in database
      db.doc(`/users/${userId[0]}`)
        .update(userDetails)
        .then(() => {
          return res.json({ message: "Details added successfully" });
        })
        .catch((err) => {
          console.error(err);
          return res.status(500).json({ error: err.code });
        });
    });
};

// Get user's details
exports.getUserDetails = (req, res) => {
  let userData = {};
  return db
    .collection("users")
    .where("username", "==", req.params.username)
    .limit(1)
    .get()
    .then((data) => {
      if (data) {
        userData.user = data.docs[0].data();

        return db
          .collection("posts")
          .where("username", "==", req.params.username)
          .orderBy("createdAt", "desc")
          .get();
      } else {
        return res.status(404).json({ error: "User not found" });
      }
    })
    .then((data) => {
      userData.posts = [];
      data.forEach((doc) => {
        userData.posts.push({
          body: doc.data().body,
          categoryId: doc.data().categoryId,
          shrineId: doc.data().shrineId,
          createdAt: doc.data().createdAt,
          username: doc.data().username,
          postThumbnail: doc.data().postThumbnail,
          userImage: doc.data().userImage,
          likeCount: doc.data().likeCount,
          commentCount: doc.data().commentCount,
          postId: doc.id,
        });
      });
      return res.json(userData);
    })
    .catch((err) => {
      console.error(err);
      return res.status(500).json({ error: err.code });
    });
};

// Get a user's details with tailored posts

// get a non authenticated user's credentials
exports.getUserCredentials = (req, res) => {
  let credentials = {};

  return db
    .collection("users")
    .where("username", "==", req.params.username)
    .limit(1)
    .get()
    .then((data) => {
      if (data) {
        credentials = data.docs[0].data();
      }
      return res.json(credentials);
    })
    .catch((err) => {
      console.error(err);
      return res.status(500).json({ error: err.code });
    });
};

//get pofile page user's credentials
exports.getProfileCredentials = async (req, res) => {
  // get ids of shrines user created
  const userShrines = db
    .collection("shrines")
    .where("creator", "==", req.params.username);

  let credentials = {};

  return db
    .collection("users")
    .where("username", "==", req.params.username)
    .limit(1)
    .get()
    .then((data) => {
      if (data) {
        credentials = data.docs[0].data();
      }
      return userShrines.get();
    })
    .then((data) => {
      let shrineIds = [];

      data.forEach((doc) => {
        shrineIds.push(doc.id);
      });

      credentials.createdShrines = shrineIds;

      return res.json(credentials);
    })
    .catch((err) => {
      console.error(err);
      return res.status(500).json({ error: err.code });
    });
};

exports.getConsecratedShrines = async (req, res) => {
  // define shrines variable
  let shrines = [];

  // loop through consecrated shrines

  let query = db
    .collection("shrines")
    .where("creator", "==", req.params.username)
    .orderBy("createdAt", "desc");

  const data = await query.get().then((data) => {
    data.forEach((doc) => {
      shrines.push({
        shrineId: doc.id,
        ...doc.data(),
      });
    });
  });

  return res.json(shrines);
};

// get logged in user credentials
exports.getLoggedInUser = (req, res) => {
  let userData = {};

  return db
    .collection("users")
    .where("userId", "==", req.params.uid)
    .limit(1)
    .get()
    .then((data) => {
      userData.credentials = data.docs[0].data();

      return db
        .collection("postLikes")
        .where("username", "==", data.docs[0].data().username)
        .get();
    })
    .then((data) => {
      userData.likes = [];
      data.forEach((doc) => {
        userData.likes.push(doc.data());
      });

      return db
        .collection("savedPosts")
        .where("username", "==", userData.credentials.username)
        .get();
    })
    .then((data) => {
      userData.savedPosts = [];
      data.forEach((doc) => {
        userData.savedPosts.push(doc.data());
      });
      return res.json(userData);
    })
    .catch((err) => {
      console.error(err);
      return res.status(500).json({ error: err.code });
    });
};

// Get authenticated user credentials
exports.getAuthenticatedUser = (req, res) => {
  let userData = {};

  return db
    .collection("users")
    .where("userId", "==", req.user.uid)
    .limit(1)
    .get()
    .then((data) => {
      if (data) {
        userData.credentials = data.docs[0].data();
        return db
          .collection("postLikes")
          .where("username", "==", req.user.username)
          .get();
      }
    })
    .then((data) => {
      userData.likes = [];
      data.forEach((doc) => {
        userData.likes.push(doc.data());
      });
      return db
        .collection("savedPosts")
        .where("username", "==", req.user.username)
        .get();
    })
    .then((data) => {
      userData.savedPosts = [];
      data.forEach((doc) => {
        userData.savedPosts.push(doc.data());
      });
      return res.json(userData);
    })
    .catch((err) => {
      console.error(err);
      return res.status(500).json({ error: err.code });
    });
};

// callback function for image upload route
exports.uploadImage = (req, res) => {
  // install the busboy package
  // then require the following packages
  const BusBoy = require("busboy");
  const path = require("path");
  const os = require("os");
  const fs = require("fs");

  // create an instance of Busboy
  const busboy = new BusBoy({ headers: req.headers });

  // initiate the event
  let imageFileName;
  let imageToBeUploaded = {};
  let resizedImage = {};

  // image url to be returned to client
  let imageUrl = "";

  busboy.on("file", (fieldname, file, filename, encoding, mimetype) => {
    if (
      mimetype !== "image/jpeg" &&
      mimetype !== "image/jpg" &&
      mimetype !== "image/png" &&
      mimetype !== "image/gif"
    ) {
      return res.status(400).json({
        error: "Wrong file type submitted, image must be in jpg, png or gif ",
      });
    }

    const imageExtension = filename.split(".")[filename.split(".").length - 1];

    const randNum = Math.round(Math.random() * 10000000000);
    const randNum2 = Math.round(Math.random() * 10000000000);

    imageFileName = `${randNum}.${imageExtension}`;
    resizedImageFilename = `${randNum2}.${imageExtension}`;

    const filepath = path.join(os.tmpdir(), imageFileName);
    const resizesImageFilepath = path.join(os.tmpdir(), resizedImageFilename);

    imageToBeUploaded = { filepath, mimetype };
    resizedImage = { resizesImageFilepath, mimetype };

    file.pipe(fs.createWriteStream(filepath));
  });

  busboy.on("finish", () => {
    //resize profile picture
    sharp(imageToBeUploaded.filepath)
      .resize(600, 600, {
        fit: "inside",
      })
      .toFile(resizedImage.resizesImageFilepath)
      .then((info) => {
        // upload to firebase storage bucket
        admin
          .storage()
          .bucket()
          .upload(resizedImage.resizesImageFilepath, {
            resumable: false,
            metadata: {
              metadata: {
                contentType: resizedImage.mimetype,
              },
            },
          })
          .then(() => {
            imageUrl = `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${resizedImageFilename}?alt=media`;

            return db.doc(`/users/${req.user.username}`).update({ imageUrl });
          })
          .then(() => {
            return res.json(imageUrl);
          })
          .catch((err) => {
            console.error(err);
            return res.status(500).json({ error: err.code });
          });
      })
      .catch((err) => {
        console.error(err);
        return res.status(500).json({ error: err.code });
      });
  });

  busboy.end(req.rawBody);
};

// callback function for editor image upload route
exports.editorUploadImage = (req, res) => {
  console.log("reqest", req.body);
  // install the busboy package
  // then require the following packages
  const BusBoy = require("busboy");
  const path = require("path");
  const os = require("os");
  const fs = require("fs");

  // create an instance of Busboy
  const busboy = new BusBoy({ headers: req.headers });

  // initiate the event
  let imageFileName;
  let imageToBeUploaded = {};
  let resizedImage = {};

  busboy.on("file", (fieldname, file, filename, encoding, mimetype) => {
    const imageExtension = filename.split(".")[filename.split(".").length - 1];

    const randNum = Math.round(Math.random() * 10000000000);
    const randNum2 = Math.round(Math.random() * 10000000000);

    imageFileName = `${randNum}.${imageExtension}`;
    resizedImageFilename = `${randNum2}.${imageExtension}`;

    const filepath = path.join(os.tmpdir(), imageFileName);
    const resizesImageFilepath = path.join(os.tmpdir(), resizedImageFilename);

    imageToBeUploaded = { filepath, mimetype };
    resizedImage = { resizesImageFilepath, mimetype };

    file.pipe(fs.createWriteStream(filepath));
  });

  busboy.on("finish", () => {
    // resize image
    sharp(imageToBeUploaded.filepath)
      .resize(600, 600, {
        fit: "inside",
      })
      .toFile(resizedImage.resizesImageFilepath)
      .then((info) => {
        // upload to firebase storage bucket
        admin
          .storage()
          .bucket()
          .upload(resizedImage.resizesImageFilepath, {
            resumable: false,
            metadata: {
              metadata: {
                contentType: resizedImage.mimetype,
              },
            },
          })
          .then((data) => {
            let file = data[0];
            console.log("returned data: ", file);

            const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${file.name}?alt=media`;

            // create json file to be sent back to sunEditor
            const result = [
              {
                url: imageUrl,
                name: file.name,
                size: file.size,
              },
            ];

            console.log("image url is :", result);

            return res.json({ result });
          })
          .catch((err) => {
            console.error(err);
            return res.status(500).json({
              error: err.code,
              errorMessage: "Image did not upload to server!",
            });
          });
      })
      .catch((err) => {
        console.error(err);
        return res.status(500).json({
          error: err.code,
          errorMessage: "Server error",
        });
      });
  });

  busboy.end(req.rawBody);
};
