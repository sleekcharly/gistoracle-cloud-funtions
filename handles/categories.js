const { db } = require("../util/admin");

// fetch featured Nav categories
exports.getFeaturedNavCategories = (req, res) => {
  db.collection("category")
    .limit(6)
    .orderBy("nav")
    .get()
    .then((data) => {
      let featuredNavCategories = [];
      data.forEach((doc) => {
        featuredNavCategories.push({
          featuredNavCategoryId: doc.id,
          ...doc.data(),
        });
      });
      return res.json(featuredNavCategories);
    })
    .catch((err) => console.error(err));
};

// fetch munu list categories
exports.getMenuNavCategories = (req, res) => {
  db.collection("category")
    .orderBy("nav")
    .startAt(7)
    .get()
    .then((data) => {
      let menuNavCategories = [];
      data.forEach((doc) => {
        menuNavCategories.push({
          categoryId: doc.id,
          ...doc.data(),
        });
      });
      return res.json(menuNavCategories);
    })
    .catch((err) => console.error(err));
};

// fetch mobile navigation menu categories
exports.getmobileMenuNavCategories = (req, res) => {
  db.collection("category")
    .orderBy("nav")
    .get()
    .then((data) => {
      let mobileMenuNavCategories = [];
      data.forEach((doc) => {
        mobileMenuNavCategories.push({
          categoryId: doc.id,
          ...doc.data(),
        });
      });
      return res.json(mobileMenuNavCategories);
    })
    .catch((err) => console.error(err));
};

// fetch all categories from database
exports.getAllCategories = (req, res) => {
  // retrieve categories
  db.collection("category")
    .get()
    .then((data) => {
      let categories = [];
      data.forEach((doc) => {
        categories.push({
          categoryId: doc.id,
          ...doc.data(),
        });
      });
      return res.json(categories);
    })
    .catch((err) => console.error(err));
};

// fetch category data from database
exports.getCategory = async (req, res) => {
  // define category data
  let categoryData = {};

  let category = [];

  //get category data
  const next = await db
    .collection("category")
    .where("name", "==", req.params.categoryName)
    .limit(1)
    .get()
    .then((data) => {
      data.forEach((doc) => {
        category.push({
          categoryId: doc.id,
        });
      });
    })
    .catch((err) => console.error(err));

  db.doc(`/category/${category[0].categoryId}`)
    .get()
    .then((doc) => {
      if (doc.exists) {
        categoryData = doc.data();
        categoryData.categoryId = category[0].categoryId;
        return res.json(categoryData);
      } else {
        return res.status(404).json({ error: "Category does not exist" });
      }
    })
    .catch((err) => {
      console.error(err);
      return res.status(500).json({ error: err.code });
    });
};

// fetch next category posts from database
exports.getNextCategoryPosts = async (req, res) => {
  // define orderBy parameter
  let filter = "";

  if (req.params.clickedButton === "new") {
    filter = "createdAt";
  } else if (req.params.clickedButton === "top") {
    filter = "likes";
  } else if (req.params.clickedButton === "spicy") {
    filter = "commentCount";
  }

  // retrive posts for pagination
  if (filter === "createdAt") {
    const next = db
      .collection("posts")
      .where("categoryName", "==", req.params.categoryName)
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
      .where("categoryName", "==", req.params.categoryName)
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
        console.log(posts);
        return res.json(posts);
      })
      .catch((err) => console.error(err));
  }
};

// fetch top 5 category shrines
exports.getTop5CatShrines = (req, res) => {
  //get top 5 shrines
  db.collection("shrines")
    .where("categoryId", "==", req.params.categoryId)
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

// fetch all category posts from database
exports.getAllCategoryPosts = (req, res) => {
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
    .where("categoryName", "==", req.params.categoryName)
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
