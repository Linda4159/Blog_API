const express = require("express");
const postController = require("../controllers/postController");
const multer = require("../middleware/multer")
const verify = require("../middleware/verify")
const restrictedTo = require("../middleware/restricted")


const router = express.Router();

// router.param("id",postController.checkID)

router.route("/highest-rated").get(postController.getHighestBlog, postController.allBlogs)

router.route("/blog-stats").get(postController.getBlogStats)
// router.route("/monthly-plan").get(postController.getMonthlyPlan)


router
  .route("/")
  .post(
    multer.uploadBlogImage,
    multer.resizeBlogImages,
    postController.postBlog)
  .get(verify, postController.allBlogs);
router
  .route("/:id")
  .get(verify,postController.getOne)
  // .patch(verifyToken, restrictedTo("author"),postController.updateBlog)
  // .delete(verifyToken, restrictedTo("admin","author"),postController.deleteBlog);

module.exports = router;
