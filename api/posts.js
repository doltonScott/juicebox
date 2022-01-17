const express = require("express");
const postsRouter = express.Router();
const { getAllPosts, createPost, updatePost, getPostById } = require("../db");
const { requireUser } = require("./utils");

postsRouter.post("/", requireUser, async (req, res, next) => {
  res.send({ message: "under construction" });
  const { title, content, tags = "" } = req.body;

  const tagArr = tags.trim().split(/\s+/);
  let postData = {};

  if (tagArr.length) {
    postData.tags = tagArr;
  }

  postsRouter.patch("/:postId", requireUser, async (req, res, next) => {
    const { postId } = req.params;
    const { title, content, tags } = req.body;

    const updateFields = {};

    if (tags && tags.length > 0) {
      updateFields.tags = tags.trim().split(/\s+/);
    }

    if (title) {
      updateFields.title = title;
    }

    if (content) {
      updateFields.content = content;
    }

    try {
      const originalPost = await getPostById(postId);

      if (originalPost.author.id === req.user.id) {
        const updatedPost = await updatePost(postId, updateFields);
        res.send({ post: updatedPost });
      } else {
        next({
          name: "UnauthorizedUserError",
          message: "You cannot update a post that is not yours",
        });
      }
    } catch ({ name, message }) {
      next({ name, message });
    }
  });

  try {
    postData = { ...postData, authorId: req.user.id, title, content };
    const post = await createPost(postData);
    if (post) {
      res.send({ post });
    } else {
      next({
        name: "Post Error",
        message: "You Shall not Post!",
      });
    }
  } catch ({ name, message }) {
    next({ name, message });
  }
});

postsRouter.use((req, res, next) => {
  console.log("A request is being made to /users");

  next();
});

postsRouter.get("/", async (req, res, next) => {
  try {
    const posts = allPosts.filter((post) => {
      return post.active || (req.user && post.author.id === req.user.id);
    });

    res.send({
      posts,
    });
  } catch ({ name, message }) {
    next({ name, message });
  }

  postsRouter.delete("/:postId", requireUser, async (req, res, next) => {
    try {
      const post = await getPostById(req.params.postId);

      if (post && post.author.id === req.user.id) {
        const updatedPost = await updatePost(post.id, { active: false });

        res.send({ post: updatedPost });
      } else {
        next(
          post
            ? {
                name: "UnauthorizedUserError",
                message: "You cannot delete a post which is not yours",
              }
            : {
                name: "PostNotFoundError",
                message: "That post does not exist",
              }
        );
      }
    } catch ({ name, message }) {
      next({ name, message });
    }
  });
});

module.exports = postsRouter;