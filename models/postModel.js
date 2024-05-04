const mongoose = require("mongoose");
const slugify = require("slugify");
const validator = require("validator")

const postSchema = new mongoose.Schema(
  {
    author: {
      type: String,
      required: true,
      trim: true,
      maxLength:[20,"author's name should not exceed 20 characters"],
      minLength:[4, "author's should be more or equal to 4 characters"],
    //   validatate:[validator.isAlpha, "author name must only contain characters"]
    },
    title: {
      type: String,
      required: [true, "Blog title required"],
      unique: true,
      trim: true,
      minLength: 6,
    },
    body: {
      type: String,
      required: true,
      trime: true,
      minLength: 10,
    },
    blogCover: {
      type: String,
      required: true,
    },
    images: {
      type: [String],
    },
    ratings: {
      type: Number,
      default: 4.5,
      min:[1, "Rating must be above 1.0"],
      max:[5, "Rating be below 5.0"]

    },
    totalRatings: {
      type: Number,
      default: 0,
    },
    duration: {
      type: Number,
    },
    language: {
      type: String,
      enum: {
        values:["easy", "medium", "hard"],
        message :"Language cane either be easy,medium or hard"
    },
      require: true,
      default: "easy",
    },
    slug: {
      type: String,
    },
    price: {
      type: Number,
      require: true,
    },
    createdAt: {
      type: Date,
      default: new Date(),
    },
    updatedAt: {
      type: Date,
      default: new Date(),
    },
    secretBlog: {
      type: Boolean,
      default: false,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

postSchema.virtual("durationInHours").get(function () {
  return this.duration / 60;
});

// DOCUMENT MIDDLEWARE
postSchema.pre("save", function (next) {
  this.slug = slugify(this.title, { lower: true });
  next();
});

// postSchema.post("save",function(doc,next){
//     console.log(doc)
//     next()
// })

// QUERY MIDDLEWARE
// postSchema.pre("find",function(next){
postSchema.pre(/^find/, function (next) {
  this.find({ secretBlog: { $ne: true } });

  this.start = Date.now();
  next();
});

postSchema.post(/^find/, function (docs, next) {
  console.log(`Query took ${Date.now() - this.start} milliseconds`);
  // console.log(docs);
  next();
});

// AGGREGATION MIDDLEWARE
postSchema.pre("aggregate", function (next) {
    this.pipeline().unshift({$match: {secretBlog :{$ne :true}}})
  console.log(this.pipeline());
  next();
});

module.exports = mongoose.model("post", postSchema);
