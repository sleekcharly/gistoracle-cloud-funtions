// bring in sharp for image resizing
const sharp = require("sharp");

const { db, admin } = require("../util/admin");
const {
  validateNewShrineData,
  validateEditedShrineData,
} = require("../util/validator");

// require the config files
const config = require("../util/config");

// fetch all shrines from database
exports.getAllShrines = (req, res) => {
  // retrieve shrines
  db.collection("shrines")
    .get()
    .then((data) => {
      let shrines = [];
      data.forEach((doc) => {
        shrines.push({
          shrineId: doc.id,
          ...doc.data(),
        });
      });
      return res.json(shrines);
    })
    .catch((err) => console.error(err));
};

// fetch shrine data from database
exports.getShrine = (req, res) => {
  // let shrine = [];
  // db.doc(`/shrines/${req.params.shrineId}`)
  // .get()
  // .then((doc) => {
  //     if (doc.exists) {
  //         shrine = doc.data();
  //         shrine.shrineId = doc.id;
  //     return res.status(200).json(shrine)
  //     } else {
  //     return res.status(404).json({ error: "Shrine does not exist" });
  //     }
  // })
  //     .catch((err) => {
  //         console.error(err);
  //         return res.status(500).json({ error: err.code });
  //     });

  // define shrine data object
  let shrineData = {};

  db.collection("shrines")
    .where("name", "==", req.params.shrineName)
    .get()
    .then((data) => {
      let shrine = [];
      data.forEach((doc) => {
        shrine.push({
          shrineId: doc.id,
          ...doc.data(),
        });
      });
      shrineData = shrine[0];

      return shrineData;
    })
    .then((data) => {
      return db.doc(`/category/${data.categoryId}`).get();
    })
    .then((doc) => {
      shrineData.categoryName = doc.data().name;
      return db
        .collection("shrineFollows")
        .where("shrineId", "==", shrineData.shrineId)
        .get();
    })
    .then((data) => {
      let followers = [];
      data.forEach((doc) => {
        followers.push({
          ...doc.data(),
        });
      });

      shrineData.followersData = followers;

      return res.json(shrineData);
    })
    .catch((err) => console.error(err));
};

// create a shrine
exports.createShrine = (req, res) => {
  // extract form data in newPost variable
  const newShrine = {
    name: req.body.shrineName,
    creator: req.user.username,
    creatorImage: req.user.imageUrl,
    avatar: "",
    createdAt: new Date().toISOString(),
    followers: 0,
    postIds: [],
    users: [],
    posts: 0,
    categoryName: req.body.categoryName,
    categoryId: null,
    description: req.body.description,
  };

  const { valid, errors } = validateNewShrineData(newShrine);

  if (!valid) return res.status(400).json(errors);

  return db
    .collection("shrines")
    .where("name", "==", newShrine.name)
    .limit(1)
    .get()
    .then((data) => {
      if (data.docs[0]) {
        return res
          .status(400)
          .json({ shrineName: "This name is already taken" });
      } else {
        // get attach category id
        return db
          .collection("category")
          .where("name", "==", newShrine.categoryName)
          .limit(1)
          .get()
          .then((data) => {
            let categoryId = [];
            data.forEach((doc) => {
              categoryId.push(doc.id);
            });

            newShrine.categoryId = categoryId[0];

            // get shrines collection from database
            return (
              db
                .collection("shrines")
                .add(newShrine)
                .then((doc) => {
                  const resShrine = newShrine;
                  resShrine.shrineId = doc.id;

                  return res.json(resShrine);
                })
                // catch any errors
                .catch((err) => {
                  console.error(err);
                  return res
                    .status(500)
                    .json({ error: "something went wrong" });
                })
            );
          })
          .catch((err) => {
            console.error(err);
          });
      }
    })
    .catch((err) => {
      console.error(err);
    });
};

// edit shrine details
exports.editShrineDetails = (req, res) => {
  const editedShrine = {
    name: req.body.name,
    description: req.body.description,
  };

  const currentShrineName = req.body.currentShrineName;
  // perform validation before proceeding
  const { valid, errors } = validateEditedShrineData(editedShrine);

  if (!valid) return res.status(400).json(errors);

  // check to see if shrineName already exists
  if (currentShrineName !== editedShrine.name) {
    return db
      .collection("shrines")
      .where("name", "==", editedShrine.name)
      .limit(1)
      .get()
      .then((data) => {
        if (data.docs[0]) {
          return res
            .status(400)
            .json({ shrineName: "This name is already taken" });
        } else {
          // if valid update shrine
          return db
            .doc(`/shrines/${req.body.shrineId}`)
            .update(editedShrine)
            .then((doc) => {
              console.log("shrine updated successfully");
              return res.json("shrine updated successfully");
            })
            .catch((err) => console.error(err));
        }
      });
  } else {
    // if valid update shrine
    return db
      .doc(`/shrines/${req.body.shrineId}`)
      .update(editedShrine)
      .then((doc) => {
        console.log("shrine updated successfully");
        return res.json("shrine updated successfully");
      })
      .catch((err) => console.error(err));
  }
};

// get authenticated user shrine names
exports.getUserSubscribedShrines = (req, res) => {
  db.collection("shrines")
    .where("users", "array-contains", req.user.userId)
    .orderBy("latestPostCreation", "desc")
    .get()
    .then((data) => {
      let shrines = [];
      data.forEach((doc) => {
        shrines.push({
          shrineId: doc.id,
          ...doc.data(),
        });
      });
      return res.json(shrines);
    })
    .catch((err) => console.error(err));
};

// fetch next shrine posts from database
exports.getNextShrinePosts = async (req, res) => {
  // define orderBy parameter
  let filter = "";

  if (req.params.clickedButton === "new") {
    filter = "createdAt";
  } else if (req.params.clickedButton === "top") {
    filter = "likes";
  } else if (req.params.clickedButton === "spicy") {
    filter = "commentCount";
  }

  // retrieve posts query
  if (filter === "createdAt") {
    const next = db
      .collection("posts")
      .where("shrineName", "==", req.params.shrineName)
      .orderBy(filter, "desc")
      .startAfter(`${req.params.parameter}`)
      .limit(10);

    // use query for pagination
    const nextSnapshot = await next
      .get()
      .then((data) => {
        let posts = [];
        data.forEach((doc) => {
          posts.push({
            postId: doc.id,
            ...doc.data(),
          });
        });
        return res.json(posts);
      })
      .catch((err) => console.error(err));
  } else {
    const docRef = db.collection("posts").doc(req.params.parameter);
    const snapshot = await docRef.get();

    const next = db
      .collection("posts")
      .where("shrineName", "==", req.params.shrineName)
      .orderBy(filter, "desc")
      .startAfter(snapshot)
      .limit(10);

    // use query for pagination
    const nextSnapshot = await next
      .get()
      .then((data) => {
        let posts = [];
        data.forEach((doc) => {
          posts.push({
            postId: doc.id,
            ...doc.data(),
          });
        });
        return res.json(posts);
      })
      .catch((err) => console.error(err));
  }
};

// fetch all shrine posts from database
exports.getAllShrinePosts = (req, res) => {
  // sort out filters and orderBy parameters
  let filter = "";

  if (req.params.parameter === "new") {
    filter = "createdAt";
  } else if (req.params.parameter === "top") {
    filter = "likes";
  } else if (req.params.parameter === "spicy") {
    filter = "commentCount";
  }

  // retrieve posts
  db.collection("posts")
    .where("shrineName", "==", req.params.shrineName)
    .orderBy(filter, "desc")
    .limit(15)
    .get()
    .then((data) => {
      let posts = [];
      data.forEach((doc) => {
        posts.push({
          postId: doc.id,
          ...doc.data(),
        });
      });
      return res.json(posts);
    })
    .catch((err) => console.error(err));
};

// callback function for following a shrine
exports.followShrine = (req, res) => {
  // set up batch writes
  const batch = db.batch();

  const followDocument = db
    .collection("shrineFollows")
    .where("userId", "==", req.user.userId)
    .where("shrineId", "==", req.params.shrineId)
    .limit(1);

  // get shrineDocument
  const shrineDocument = db.doc(`/shrines/${req.params.shrineId}`);

  let shrineData;

  // check to see if shrine exists before following
  shrineDocument
    .get()
    .then((doc) => {
      if (doc.exists) {
        shrineData = doc.data();
        shrineData.shrineId = doc.id;
        shrineData.followingUser = req.user.userId;
        return followDocument.get();
      } else {
        return res.status(404).json({ error: "Shrine not found" });
      }
    })
    .then((data) => {
      if (data.empty) {
        return db
          .collection("shrineFollows")
          .add({
            shrineId: req.params.shrineId,
            userId: req.user.userId,
          })
          .then((data) => {
            shrineData.followers++;
            return shrineDocument.update({ followers: shrineData.followers });
          })
          .then(() => {
            return db
              .collection("shrineFollows")
              .where("shrineId", "==", req.params.shrineId)
              .where("userId", "==", req.user.userId)
              .get();
          })
          .then((data) => {
            let followersData = [];
            data.forEach((doc) => {
              followersData.push({
                ...doc.data(),
              });
            });

            shrineData.followersData = followersData;

            // update user vibrations
            return db
              .collection("users")
              .where("username", "==", req.user.username)
              .limit(1)
              .get();
          })
          .then((data) => {
            let userId = [];
            data.forEach((doc) => {
              userId.push(doc.id);
            });

            //update user document
            const userRef = db.doc(`/users/${userId[0]}`);
            batch.update(userRef, {
              vibrations: admin.firestore.FieldValue.increment(0.2),
              shrines: admin.firestore.FieldValue.arrayUnion(
                req.params.shrineId
              ),
            });

            // update shrine document
            const shrineRef = db.doc(`/shrines/${req.params.shrineId}`);
            batch.update(shrineRef, {
              users: admin.firestore.FieldValue.arrayUnion(req.user.userId),
            });

            batch.commit();

            return res.json(shrineData);
          });
      } else {
        return res.status(400).json({ error: "shrine already followed" });
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: err.code });
    });
};

// callback function for unfollowing a shrine
exports.unFollowShrine = (req, res) => {
  // define batch write
  const batch = db.batch();

  // retrieve shrinefollows  document from database
  const followDocument = db
    .collection("shrineFollows")
    .where("userId", "==", req.user.userId)
    .where("shrineId", "==", req.params.shrineId)
    .limit(1);

  // retrieve shrine from the database
  const shrineDocument = db.doc(`/shrines/${req.params.shrineId}`);

  let shrineData;

  // check to see if the shrine exists before unfollowing
  shrineDocument
    .get()
    .then((doc) => {
      if (doc.exists) {
        shrineData = doc.data();
        shrineData.shrineId = doc.id;
        shrineData.followingUser = req.user.userId;
        return followDocument.get();
      } else {
        return res.status(404).json({ error: "Shrine not found" });
      }
    })
    .then((data) => {
      if (data.empty) {
        return res.status(400).json({ error: "Post not followed" });
      } else {
        return db
          .doc(`/shrineFollows/${data.docs[0].id}`)
          .delete()
          .then(() => {
            shrineData.followers--;
            return shrineDocument.update({
              followers: shrineData.followers,
            });
          })
          .then(() => {
            return db
              .collection("shrineFollows")
              .where("shrineId", "==", req.params.shrineId)
              .limit(3)
              .get();
          })
          .then((data) => {
            let followersData = [];
            data.forEach((doc) => {
              followersData.push({
                ...doc.data(),
              });
            });

            shrineData.followersData = followersData;

            // update user vibrations
            return db
              .collection("users")
              .where("username", "==", req.user.username)
              .limit(1)
              .get();
          })
          .then((data) => {
            let userId = [];
            data.forEach((doc) => {
              userId.push(doc.id);
            });

            const userRef = db.doc(`/users/${userId[0]}`);
            batch.update(userRef, {
              vibrations: admin.firestore.FieldValue.increment(-0.2),
              shrines: admin.firestore.FieldValue.arrayRemove(
                req.params.shrineId
              ),
            });

            // update shrine document
            const shrineRef = db.doc(`/shrines/${req.params.shrineId}`);
            batch.update(shrineRef, {
              users: admin.firestore.FieldValue.arrayRemove(req.user.userId),
            });

            batch.commit();

            res.json(shrineData);
          });
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: err.code });
    });
};

// callback for getting trending shrines
exports.top5FollowedShrines = (req, res) => {
  // get top 5 followed shrines based on followers
  db.collection("shrines")
    .orderBy("followers", "desc")
    .limit(5)
    .get()
    .then((data) => {
      let shrines = [];
      data.forEach((doc) => {
        shrines.push({
          shrineId: doc.id,
          ...doc.data(),
        });
      });

      return res.json(shrines);
    })
    .catch((err) => {
      console.error(err);
    });
};

// callback for uploading shrine avatar
exports.uploadShrineAvatar = (req, res) => {
  // require the following packages
  const BusBoy = require("busboy");
  const path = require("path");
  const os = require("os");
  const fs = require("fs");

  // create an instance of Busboy
  const busboy = new BusBoy({ headers: req.headers });

  // initiate the event
  let imageFileName;
  let resizedImageFileName;
  let imageToBeUploaded = {};
  let resizedImage = {};

  busboy.on("file", (fieldname, file, filename, encoding, mimetype) => {
    // check for allowed image types
    if (
      mimetype !== "image/jpeg" &&
      mimetype !== "image/jpg" &&
      mimetype !== "image/png" &&
      mimetype !== "image/gif" &&
      mimetype !== "image/gif" &&
      mimetype !== "image/tiff"
    ) {
      return res.status(400).json({
        error:
          "Wrong file type submitted, image must be in jpg, png or gif formats",
      });
    }

    // construct image extension
    const imageExtension = filename.split(".")[filename.split(".").length - 1];

    const randNum = Math.round(Math.random() * 10000000000);
    const randNum2 = Math.round(Math.random() * 10000000000);

    imageFileName = `${randNum}.${imageExtension}`;
    resizedImageFileName = `${randNum2}.${imageExtension}`;

    const filepath = path.join(os.tmpdir(), imageFileName);
    const resizedImageFilepath = path.join(os.tmpdir(), resizedImageFileName);

    imageToBeUploaded = { filepath, mimetype };
    resizedImage = { resizedImageFilepath, mimetype };

    file.pipe(fs.createWriteStream(filepath));
  });

  busboy.on("finish", () => {
    // resize shrine avatar befor uploading
    sharp(imageToBeUploaded.filepath)
      .resize(600, 600, {
        fit: "inside",
      })
      .toFile(resizedImage.resizedImageFilepath)
      .then((info) => {
        // upload to firebase storage bucket
        admin
          .storage()
          .bucket()
          .upload(resizedImage.resizedImageFilepath, {
            resumable: false,
            metadata: {
              metadata: {
                contentType: resizedImage.mimetype,
              },
            },
          })
          .then(() => {
            console.log("avatar uploaded");
            // update shrine avatar in shrine document
            return db
              .collection("shrines")
              .where("name", "==", req.params.shrineName)
              .limit(1)
              .get();
          })
          .then((data) => {
            const shrineAvatar = `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${resizedImageFileName}?alt=media`;

            let shrineId = [];
            data.forEach((doc) => {
              shrineId.push(doc.id);
            });

            const shrineRef = db.doc(`/shrines/${shrineId[0]}`);
            shrineRef.update({
              avatar: shrineAvatar,
            });
          })
          .then(() => {
            return res.json({ message: "Image uploaded successfully" });
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

// callback for changing shrine avatar
exports.changeShrineAvatar = (req, res) => {
  // require the following packages
  const BusBoy = require("busboy");
  const path = require("path");
  const os = require("os");
  const fs = require("fs");

  // create an instance of Busboy
  const busboy = new BusBoy({ headers: req.headers });

  // initiate the event
  let imageFileName;
  let resizedImageFileName;
  let imageToBeUploaded = {};
  let resizedImage = {};

  busboy.on("file", (fieldname, file, filename, encoding, mimetype) => {
    // check for allowed image types
    if (
      mimetype !== "image/jpeg" &&
      mimetype !== "image/jpg" &&
      mimetype !== "image/png" &&
      mimetype !== "image/gif" &&
      mimetype !== "image/tiff"
    ) {
      return res.status(400).json({
        error:
          "Wrong file type submitted, image must be in jpg, png or gif formats",
      });
    }

    // construct image extension
    const imageExtension = filename.split(".")[filename.split(".").length - 1];

    const randNum = Math.round(Math.random() * 10000000000);
    const randNum2 = Math.round(Math.random() * 10000000000);

    imageFileName = `${randNum}.${imageExtension}`;
    resizedImageFileName = `${randNum2}.${imageExtension}`;

    const filepath = path.join(os.tmpdir(), imageFileName);
    const resizedImageFilepath = path.join(os.tmpdir(), resizedImageFileName);

    imageToBeUploaded = { filepath, mimetype };
    resizedImage = { resizedImageFilepath, mimetype };

    file.pipe(fs.createWriteStream(filepath));
  });

  busboy.on("finish", () => {
    // resize shrine avatar befor uploading
    sharp(imageToBeUploaded.filepath)
      .resize(600, 600, {
        fit: "inside",
      })
      .toFile(resizedImage.resizedImageFilepath)
      .then((info) => {
        // upload to firebase storage bucket
        admin
          .storage()
          .bucket()
          .upload(resizedImage.resizedImageFilepath, {
            resumable: false,
            metadata: {
              metadata: {
                contentType: resizedImage.mimetype,
              },
            },
          })
          .then(() => {
            const shrineAvatar = `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${resizedImageFileName}?alt=media`;

            const shrineRef = db.doc(`/shrines/${req.params.shrineId}`);
            shrineRef.update({
              avatar: shrineAvatar,
            });
          })
          .then(() => {
            return res.json({ message: "Image uploaded successfully" });
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
