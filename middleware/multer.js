const multer = require("multer")
const sharp = require("sharp");


// CONFIGURING-MULTER
// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "public/uploads");
//   },
//   filename: (req, file, cb) => {
//     const ext = file.mimetype.split("/")[1]
//     cb(null,`blog-${req.body.title}-${Date.now()}-cover.jpeg`);
//   },
// });

// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "public/");
//   },
//   filename: (req, file, cb) => {
//     const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
//     cb(null, file.fieldname + "-" + uniqueSuffix);
//   },
// });


// Memory storage
const multerStorage = multer.memoryStorage()

// fileFilter

const multerFilter = (req,file,cb)=>{
    if(file.mimetype.startsWith("image")){
        cb(null, true)
    }else{
        cb(error("Not an image,please upload only images",400),false)
    }
}

const upload = multer({
  storage: multerStorage,
  fileFilter : multerFilter
});

exports.uploadBlogImage = upload.fields([
  { name: "blogCover", maxCount: 1 },
  { name: "images", maxCount: 3 },
]);

exports.resizeBlogImages = async (req, file, next) => {
  // console.log(req.files);
   req.body.blogCover = `blog-${req.body.title}-${Date.now()}-cover.jpeg`;

  // blogCover
  if (!req.files.blogCover || !req.files.images) return next();

  await sharp(req.files.blogCover[0].buffer)
    .resize(2000, 1300)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(`public/${req.body.blogCover}`);

  // images

  req.body.images = []
  await Promise.all (req.files.images.map(async(file,i)=>{
    const filename =`blog-${req.body.title}-${Date.now()}-${i + 1}.jpeg`

    await sharp(req.files.images[0].buffer)
    .resize(2000, 1300)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(`public/${filename}`);

    req.body.images.push(filename)
  }))


  next();
};
