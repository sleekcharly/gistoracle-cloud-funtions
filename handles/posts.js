const { db, admin } = require("../util/admin");
const { validateEditedPostData } = require("../util/validator");

const { tinyUrl } = require("tinyurl");

let request = require("request");

// fetch all posts from database
exports.getAllPosts = async (req, res) => {
  // define orderBy parameter
  let filter = "";

  if (req.params.clickedButton === "new") {
    filter = "createdAt";
  } else if (req.params.clickedButton === "top") {
    filter = "likes";
  } else if (req.params.clickedButton === "spicy") {
    filter = "commentCount";
  }

  // retrieve posts
  db.collection("posts")
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

// fetch next posts from database
exports.getNextPosts = async (req, res) => {
  // define orderBy parameter
  let filter = "";

  if (req.params.clickedButton === "new") {
    filter = "createdAt";
  } else if (req.params.clickedButton === "top") {
    filter = "likes";
  } else if (req.params.clickedButton === "spicy") {
    filter = "commentCount";
  }

  // retrieve posts
  // start paginate
  if (filter === "createdAt") {
    const next = db
      .collection("posts")
      .orderBy(filter, "desc")
      .startAfter(`${req.params.parameter}`)
      .limit(10);

    // use the query for pagination
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
      .orderBy(filter, "desc")
      .startAfter(snapshot)
      .limit(10);

    // use the query for pagination
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

// fetch total posts count from database
exports.getTotalPostsCount = (req, res) => {
  var postMetricsRef = db.collection("postsMetrics").doc("count");

  postMetricsRef
    .get()
    .then((doc) => {
      if (doc.exists) {
        return res.json(doc.data().total);
      } else {
        console.log("no such document!");
      }
    })
    .catch((err) => {
      console.log("Error getting document: ", err);
    });
};

// fetch all posts from database
exports.getAllPostIds = (req, res) => {
  // define orderBy parameter
  let filter = "";

  if (req.params.clickedButton === "new") {
    filter = "createdAt";
  } else if (req.params.clickedButton === "top") {
    filter = "likes";
  } else if (req.params.clickedButton === "spicy") {
    filter = "commentCount";
  }

  // retrieve posts
  db.collection("posts")
    .orderBy(filter, "desc")
    .get()
    .then((data) => {
      let postIds = [];
      data.forEach((doc) => {
        postIds.push(doc.id);
      });
      return res.json(postIds);
    })
    .catch((err) => console.error(err));
};

//get all posts based on user's categories and shrines
exports.getTailoredUserPost = async (req, res) => {
  // define orderBy parameter
  let filter = "";

  if (req.params.clickedButton === "new") {
    filter = "createdAt";
  } else if (req.params.clickedButton === "top") {
    filter = "likes";
  } else if (req.params.clickedButton === "spicy") {
    filter = "commentCount";
  }

  // define shrines variable containing list of user subscribed shrines
  let shrines = await req.user.shrines.slice(0, 10);

  // define posts array
  let posts = [];

  // loop through subscribed shrines to get user tailored posts
  for (i = 0; i < shrines.length; i++) {
    let query = db
      .collection("posts")
      .where("shrineId", "==", shrines[i])
      .orderBy(filter, "desc")
      .limit(3);

    const data = await query.get().then((data) => {
      data.forEach((doc) => {
        posts.push({
          postId: doc.id,
          ...doc.data(),
        });
      });
    });
  }

  posts = posts.sort((a, b) => {
    if (filter === "createdAt") {
      return new Date(b.createdAt) - new Date(a.createdAt);
    } else if (filter === "likes") {
      return b.likes - a.likes;
    } else {
      return b.commentCount - a.commentCount;
    }
  });

  return res.json(posts);
};

//get all posts based on user's and shrines
exports.getNextTailoredUserPost = async (req, res) => {
  // define orderBy parameter
  let filter = "";

  if (req.params.clickedButton === "new") {
    filter = "createdAt";
  } else if (req.params.clickedButton === "top") {
    filter = "likes";
  } else if (req.params.clickedButton === "spicy") {
    filter = "commentCount";
  }

  // retrieve posts
  // start paginate
  // define shrines variable containing list of user subscribed shrines
  let prevShrines = req.params.shrineFetchNo - 10;

  let shrines = req.user.shrines.slice(prevShrines, req.params.shrineFetchNo);

  // define posts array
  let posts = [];

  // loop through subscribed shrines to get user tailored posts
  for (i = 0; i < shrines.length; i++) {
    let query = db
      .collection("posts")
      .where("shrineId", "==", shrines[i])
      .limit(3);

    const data = await query.get().then((data) => {
      data.forEach((doc) => {
        posts.push({
          postId: doc.id,
          ...doc.data(),
        });
      });
    });
  }

  posts = posts.sort((a, b) => {
    if (filter === "createdAt") {
      return new Date(b.createdAt) - new Date(a.createdAt);
    } else if (filter === "likes") {
      return b.likes - a.likes;
    } else {
      return b.commentCount - a.commentCount;
    }
  });

  return res.json(posts);
};

//get all posts Ids based on user's categories and shrines
exports.getTailoredUserPostIds = async (req, res) => {
  // define shrines variable containing list of user subscribed shrines
  let shrines = req.user.shrines;

  // define orderBy parameter
  let filter = "";

  if (req.params.clickedButton === "new") {
    filter = "createdAt";
  } else if (req.params.clickedButton === "top") {
    filter = "likes";
  } else if (req.params.clickedButton === "spicy") {
    filter = "commentCount";
  }

  // define posts array
  let postIds = [];

  // loop through subscribed shrines to get user tailored posts
  for (i = 0; i < shrines.length; i++) {
    let query = db
      .collection("posts")
      .where("shrineId", "==", shrines[i])
      .orderBy(filter, "desc")
      .limit(3);

    const data = await query.get().then((data) => {
      data.forEach((doc) => {
        postIds.push(doc.id);
      });
    });
  }

  return res.json(postIds);
};

// get user posts
exports.getUserPosts = (req, res) => {
  // retrieve posts
  db.collection("posts")
    .where("username", "==", req.params.username)
    .orderBy("createdAt", "desc")
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

// get saved user posts
exports.getUserSavedPosts = async (req, res) => {
  // define savedPosts variable containing list of user saved posts
  let savedPosts = req.user.savedPosts.slice(0, 10);

  // define posts array
  let posts = [];

  // loop through saved posts to get saved posts from database
  for (i = 0; i < savedPosts.length; i++) {
    let query = db
      .collection("posts")
      .where("postId", "==", savedPosts[i].postId);

    const data = await query.get().then((data) => {
      data.forEach((doc) => {
        posts.push({
          postId: doc.id,
          ...doc.data(),
        });
      });
    });
  }
  return res.json(posts);
};

// get next Saved posts
exports.getNextSavedPosts = async (req, res) => {
  let prevPosts = req.params.postsFetchNo - 10;

  // define savedPosts variable containing list of user saved posts
  let savedPosts = req.user.savedPosts.slice(
    prevPosts,
    req.params.postsFetchNo
  );

  let posts = [];

  // loop through saved posts to get saved posts from database
  for (i = 0; i < savedPosts.length; i++) {
    let query = db
      .collection("posts")
      .where("postId", "==", savedPosts[i].postId);

    const data = await query.get().then((data) => {
      data.forEach((doc) => {
        posts.push({
          postId: doc.id,
          ...doc.data(),
        });
      });
    });
  }
  return res.json(posts);
};

//get top user posts
exports.getTopUserPosts = (req, res) => {
  // retrieve top liked posts
  db.collection("posts")
    .where("username", "==", req.params.username)
    .orderBy("likes", "desc")
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

// get most commented on posts
exports.getSpicyUserPosts = (req, res) => {
  // retrieve most commented posts
  db.collection("posts")
    .where("username", "==", req.params.username)
    .orderBy("commentCount", "desc")
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

//fetch next user posts from database
exports.getNextUserPosts = async (req, res) => {
  // define orderBy parameter
  let filter = "";

  if (req.params.clickedButton === "new") {
    filter = "createdAt";
  } else if (req.params.clickedButton === "top") {
    filter = "likes";
  } else if (req.params.clickedButton === "spicy") {
    filter = "commentCount";
  }

  // retrieve data for pagination
  if (filter === "createdAt") {
    const next = db
      .collection("posts")
      .where("username", "==", req.params.username)
      .orderBy(filter, "desc")
      .startAfter(`${req.params.parameter}`)
      .limit(10);

    // use the query for pagination
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
      .where("username", "==", req.params.username)
      .orderBy(filter, "desc")
      .startAfter(snapshot)
      .limit(10);

    // use the query for pagination
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

// create a post
exports.createPost = (req, res) => {
  if (req.body.body.trim() === "") {
    return res.status(400).json({
      body: "Post body is empty",
    });
  }

  // extract form data in newPost variable
  const newPost = {
    title: req.body.title,
    slug: req.body.slug,
    body: req.body.body,
    username: req.user.username,
    userImage: req.user.imageUrl,
    location: req.user.location,
    createdAt: new Date().toISOString(),
    likes: 0,
    saves: 0,
    unlikes: 0,
    commentCount: 0,
    shrineId: req.body.shrineId,
    postId: "",
    categoryId: req.body.categoryId,
    categoryName: req.body.categoryName,
    shrineName: req.body.shrineName,
    postThumbnail: req.body.postThumbnail ? req.body.postThumbnail : "",
  };

  // get posts collection from database
  db.collection("posts")
    .add(newPost)
    .then((doc) => {
      const resPost = newPost;
      resPost.postId = doc.id;

      // set postId field
      async function updatePostDocument(db) {
        const postRef = db.collection("posts").doc(resPost.postId);

        // set the postId field
        const postRes = await postRef.update({ postId: resPost.postId });

        //call await function
        postRes;
      }

      // call async function
      updatePostDocument(db);

      // send response to client
      res.json(resPost);

      return resPost;
    })
    .then((data) => {
      // update the shrines collection posts array field in firebase.
      async function updateDocumentArray(db) {
        const admin = require("firebase-admin");

        //shrine ref
        const shrineRef = db.collection("shrines").doc(data.shrineId);
        const unionRes = await shrineRef.update({
          postIds: admin.firestore.FieldValue.arrayUnion(data.postId),
        });

        unionRes;
      }
      updateDocumentArray(db);
    })
    // catch any errors
    .catch((err) => {
      res.status(500).json({ error: "something went wrong. try again" });
      console.error(err);
    });
};

// edit post callback function
exports.editPost = async (req, res) => {
  // extract form data in edited post
  const editedPost = {
    title: req.body.title,
    body: req.body.body,
    postId: req.body.postId,
    slug: req.body.slug,
    postThumbnail: req.body.postThumbnail,
  };

  // perform validation o edited post data
  const { valid, errors } = validateEditedPostData(editedPost);

  if (!valid) return res.status(400).json(errors);

  // update post document
  db.doc(`/posts/${editedPost.postId}`)
    .update({
      title: editedPost.title,
      body: editedPost.body,
      slug: editedPost.slug,
      postThumbnail: editedPost.postThumbnail,
    })
    .then(() => {
      return res.json("Post updated successfully");
    })
    .catch((err) => {
      console.error(err);
      return res.status(500).json({ error: err.code });
    });
};

// fetch a single post
exports.getPost = (req, res) => {
  // define postData variable
  let postData = {};
  db.doc(`/posts/${req.params.postId}`)
    .get()
    .then((doc) => {
      // check if post exists
      if (!doc.exists) {
        return res.status(404).json({ error: "Post not found!" });
      }
      postData = doc.data();
      postData.postId = doc.id;

      return res.json(postData);
    })
    // log errors on the console
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: err.code });
    });
};

// fetch a post's comments
exports.getPostComments = (req, res) => {
  // retrieve comments
  db.collection("comments")
    .orderBy("createdAt", "desc")
    .where("postId", "==", req.params.postId)
    .get()
    .then((data) => {
      let comments = [];

      data.forEach((doc) => {
        comments.push({
          commentId: doc.id,
          ...doc.data(),
        });
      });

      return res.json(comments);
    })
    .catch((err) => {
      console.error(err);
      console.log(err.message);
    });
};

// fetch a single comment
exports.getComment = (req, res) => {
  // define comment data variable
  let commentData = {};
  db.doc(`/comments/${req.params.commentId}`)
    .get()
    .then((doc) => {
      // check if comment exists
      if (!doc.exists) {
        return res.status(404).json({ error: "Comment not found" });
      }
      commentData = doc.data();
      commentData.commentId = doc.id;

      // fetch comments attached to retrieved comment
      return db
        .collection("comments")
        .orderBy("createdAt", "desc")
        .where("commentId", "==", req.params.commentId)
        .get();
    })
    .then((data) => {
      // define comments array
      commentData.comments = [];
      data.forEach((doc) => {
        commentData.comments.push(doc.data());
      });
      return res.json(commentData);
    })
    // log errors on the console
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: err.code });
    });
};

// get replies to a particular comment
exports.getReplies = (req, res) => {
  // define query for getting comment replies
  db.collection("comments")
    .where("commentId", "==", req.params.commentId)
    .orderBy("createdAt", "desc")
    .get()
    .then((data) => {
      let replies = [];
      data.forEach((doc) => {
        let replyId = doc.id;
        replies.push({
          replyId,
          ...doc.data(),
        });
      });
      return res.json(replies);
    })
    .catch((err) => console.error(err));
};

// callback function for comments on posts
exports.commentOnPost = (req, res) => {
  if (req.body.body === "")
    return res.status(400).json({
      comment: "Must not be empty",
    });

  // store comment form data in newComment variable
  const newComment = {
    body: req.body.body,
    createdAt: new Date().toISOString(),
    postId: req.params.postId,
    commentPostId: req.params.postId,
    username: req.user.username,
    userImage: req.user.imageUrl,
    likes: 0,
    comments: 0,
  };

  // check to see if post exist before pushing comments to database.
  db.doc(`/posts/${req.params.postId}`)
    .get()
    .then((doc) => {
      if (!doc.exists) {
        return res.status(404).json({ error: "Post not found" });
      }
      return doc.ref.update({ commentCount: doc.data().commentCount + 1 });
    })
    .then(() => {
      return db.collection("comments").add(newComment);
    })
    .then(() => {
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
      userRef.update({ vibrations: admin.firestore.FieldValue.increment(0.2) });

      res.json(newComment);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: "Something went wrong" });
    });
};

// callback function for commenting on comments
exports.commentOnComment = (req, res) => {
  // initiate batch
  const batch = db.batch();

  if (req.body.body === "")
    return res.status(400).json({
      commentReply: "Must not be empty",
    });

  const newCommentOnComment = {
    body: req.body.body,
    createdAt: new Date().toISOString(),
    commentId: req.params.commentId,
    commentPostId: req.body.commentPostId,
    username: req.user.username,
    userImage: req.user.imageUrl,
    likes: 0,
    comments: 0,
  };

  db.doc(`/comments/${req.params.commentId}`)
    .get()
    .then((doc) => {
      if (!doc.exists) {
        return res.status(404).json({ error: "Comment not found" });
      }
      return db.collection("comments").add(newCommentOnComment);
    })
    .then(() => {
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

      const commentRef = db.doc(`/comments/${req.params.commentId}`);
      batch.update(commentRef, {
        comments: admin.firestore.FieldValue.increment(1),
      });

      const userRef = db.doc(`/users/${userId[0]}`);
      batch.update(userRef, {
        vibrations: admin.firestore.FieldValue.increment(0.2),
      });

      const postRef = db.doc(`/posts/${req.body.commentPostId}`);
      batch.update(postRef, {
        commentCount: admin.firestore.FieldValue.increment(1),
      });

      return batch.commit();
    })
    .then(() => {
      return res.json(newCommentOnComment);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: "Something went wrong" });
    });
};

// callback function for liking Posts
exports.likePost = (req, res) => {
  const likeDocument = db
    .collection("postLikes")
    .where("username", "==", req.user.username)
    .where("postId", "==", req.params.postId)
    .limit(1);

  const postDocument = db.doc(`/posts/${req.params.postId}`);
  let postData;

  // check to see if post exists before liking the post
  postDocument
    .get()
    .then((doc) => {
      if (doc.exists) {
        postData = doc.data();
        postData.postId = doc.id;
        return likeDocument.get();
      } else {
        return res.status(404).json({ error: "Post not found" });
      }
    })
    .then((data) => {
      if (data.empty) {
        return db
          .collection("postLikes")
          .add({
            postId: req.params.postId,
            username: req.user.username,
          })
          .then(() => {
            postData.likes++;
            return postDocument.update({ likes: postData.likes });
          })
          .then(() => {
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
            userRef.update({
              vibrations: admin.firestore.FieldValue.increment(0.15),
            });

            return res.json(postData);
          });
      } else {
        return res.status(400).json({ error: "post already liked" });
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: err.code });
    });
};

// callback function for unliking a post
exports.unlikePost = (req, res) => {
  // retrieve postLikes document from database
  const likeDocument = db
    .collection("postLikes")
    .where("username", "==", req.user.username)
    .where("postId", "==", req.params.postId)
    .limit(1);

  // retrieve post from the database
  const postDocument = db.doc(`/posts/${req.params.postId}`);

  let postData;

  // check to see if the post exists before unliking
  postDocument
    .get()
    .then((doc) => {
      if (doc.exists) {
        postData = doc.data();
        postData.postId = doc.id;
        return likeDocument.get();
      } else {
        return res.status(404).json({ error: "Post  not found" });
      }
    })
    .then((data) => {
      if (data.empty) {
        return res.status(400).json({ error: "Post not liked" });
      } else {
        return db
          .doc(`/postLikes/${data.docs[0].id}`)
          .delete()
          .then(() => {
            postData.likes--;
            return postDocument.update({
              likes: postData.likes,
            });
          })
          .then(() => {
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
            userRef.update({
              vibrations: admin.firestore.FieldValue.increment(-0.15),
            });

            res.json(postData);
          });
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: err.code });
    });
};

// callback function for saving posts to user page on client
exports.savePost = (req, res) => {
  // get saved posts collection from user collection
  const savedPostDocument = db
    .collection("savedPosts")
    .where("username", "==", req.user.username)
    .where("postId", "==", req.params.postId)
    .limit(1);

  // get postDocument
  const postDocument = db.doc(`/posts/${req.params.postId}`);

  //get user document
  const userRef = db.doc(`/users/${req.user.username}`);

  // get users collection
  // const usersRef = db.collection("users");

  let postData;

  // check to see if post exists before saving the post
  postDocument
    .get()
    .then((doc) => {
      if (doc.exists) {
        postData = doc.data();
        postData.postId = doc.id;
        return savedPostDocument.get();
      } else {
        return res.status(404).json({ error: "Post not found" });
      }
    })
    .then((data) => {
      if (data.empty) {
        return db
          .collection("savedPosts")
          .add({
            postId: req.params.postId,
            username: req.user.username,
          })
          .then(() => {
            // check to see if a saves field exists
            postData.saves ? postData.saves++ : (postData.saves = 1);

            // check to see if a saves field exist in the document and then update the post document in cloud
            return postDocument.set({ saves: postData.saves }, { merge: true });
          })
          .then(() => {
            // increment savedPosts field in user database
            return userRef.update({
              savedPosts: admin.firestore.FieldValue.increment(1),
            });
          })
          .then(() => {
            return res.json(postData);
          });
      } else {
        return res.status(400).json({ error: "post already saved" });
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: err.code });
    });
};

// callback function for unsaving posts on client user profile page
exports.unSavePost = (req, res) => {
  // get saved posts collection from user collection
  const savedPostDocument = db
    .collection("savedPosts")
    .where("username", "==", req.user.username)
    .where("postId", "==", req.params.postId)
    .limit(1);

  // get user document
  const userRef = db.doc(`/users/${req.user.username}`);

  // get users collection
  // const usersRef = db.collection("users");

  // get postDocument from database
  const postDocument = db.doc(`/posts/${req.params.postId}`);

  let postData;

  // check to see if post exists before saving the post
  postDocument
    .get()
    .then((doc) => {
      if (doc.exists) {
        postData = doc.data();
        postData.postId = doc.id;
        return savedPostDocument.get();
      } else {
        return res.status(404).json({ error: "Post not found" });
      }
    })
    .then((data) => {
      if (data.empty) {
        return res.status(400).json({ error: "Post not saved" });
      } else {
        return db
          .doc(`/savedPosts/${data.docs[0].id}`)
          .delete()
          .then(() => {
            postData.saves--;
            return postDocument.update({
              saves: postData.saves,
            });
          })
          .then(() => {
            return userRef.update({
              savedPosts: admin.firestore.FieldValue.increment(-1),
            });
          })
          .then(() => {
            res.json(postData);
          });
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: err.code });
    });
};

// callback function for liking comments
exports.likeComment = (req, res) => {
  const likeDocument = db
    .collection("commentLikes")
    .where("username", "==", req.user.username)
    .where("commentId", "==", req.params.commentId)
    .limit(1);

  const commentDocument = db.doc(`/comments/${req.params.commentId}`);

  let commentData;

  // check to see if comment exists before liking the comment
  commentDocument
    .get()
    .then((doc) => {
      if (doc.exists) {
        commentData = doc.data();
        commentData.commentId = doc.id;
        return likeDocument.get();
      } else {
        return res.status(404).json({ error: "Comment not found" });
      }
    })
    .then((data) => {
      if (data.empty) {
        return db
          .collection("commentLikes")
          .add({
            commentId: req.params.commentId,
            username: req.user.username,
          })
          .then(() => {
            commentData.likes++;
            return commentDocument.update({ likes: commentData.likes });
          })
          .then(() => {
            return res.json(commentData);
          });
      } else {
        return res.status(400).json({ error: "comment already liked" });
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: err.code });
    });
};

// callback function for unliking a comment
exports.unlikeComment = (req, res) => {
  // retrieve commentLikes document from database
  const likeDocument = db
    .collection("commentLikes")
    .where("username", "==", req.user.username)
    .where("commentId", "==", req.params.commentId)
    .limit(1);

  // retrieve post from the database
  const commentDocument = db.doc(`/comments/${req.params.commentId}`);

  let commentData;

  // check to see if the comment exists before unliking
  commentDocument
    .get()
    .then((doc) => {
      if (doc.exists) {
        commentData = doc.data();
        commentData.commentId = doc.id;
        return likeDocument.get();
      } else {
        return res.status(404).json({ error: "Comment not found" });
      }
    })
    .then((data) => {
      if (data.empty) {
        return res.status(400).json({ error: "Comment not liked" });
      } else {
        return db
          .doc(`/commentLikes/${data.docs[0].id}`)
          .delete()
          .then(() => {
            commentData.likes--;
            return commentDocument.update({
              likes: commentData.likes,
            });
          })
          .then(() => {
            res.json(commentData);
          });
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: err.code });
    });
};

// callback function for shortening post url
exports.shortenUrl = (req, res) => {
  let linkRequest = {
    destination: req.body,
    domain: { fullName: "gistoracle.com" },
  };

  let requestHeaders = {
    "content-Type": "application/json",
    apikey: "03a31668b48f46578b1a52aba29189f2",
  };

  request(
    {
      uri: "https://api.rebrandly.com/v1/links",
      method: "POST",
      body: JSON.stringify(linkRequest),
      headers: requestHeaders,
    },
    (err, response, body) => {
      let link = JSON.parse(body);
      console.log(
        `Long URL was ${link.destination}, short URL is ${link.shortUrl}`
      );
    }
  );
};

//  Callback function for deleting a post
exports.deletePost = (req, res) => {
  // retrieve document from database
  const document = db.doc(`/posts/${req.params.postId}`);

  document
    .get()
    .then((doc) => {
      // check if the document exists in the database
      if (!doc.exists) {
        return res.status(404).json({ error: "Post not found " });
      }

      // ensure user can only delete post that he or she created
      if (doc.data().username !== req.user.username) {
        return res.status(403).json({ error: "Unauthorized" });
      } else {
        return document.delete();
      }
    })
    .then(() => {
      res.json({ message: "Post deleted successfully" });
    })
    // catch any sever errors
    .catch((err) => {
      console.error(err);
      return res.status(500).json({ error: err.code });
    });
};
