const express = require("express");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const globalErrorHandler = require("./errorController");
const postModel = require("../models/postModel");
const APIfeatures = require("./../utils/APIfeatures");

// exports.checkID = async (req, res, next, value) => {
//   console.log("Blog ID is " + value);

//   // check if the blog exist
//   let blog = await postModel.findById(value);

//   if (!blog) {
//     return res
//       .status(404)
//       .json({ message: "The blog you are looking for do not exist" });
//   }

//   next();
// };

exports.getHighestBlog = (req, res, next) => {
  req.query.limit = "5";
  req.query.sort = "-duration";
  req.query.fields = "author, title, duration, ratings, price";
  next;
};

exports.postBlog = catchAsync(async (req, res, next) => {
  
    const {
      author,
      title,
      body,
      blogCover,
      images,
      ratings,
      totalRatings,
      price,
      duration,
      language,
      secretBlog
    } = req.body;

    if (!author || !title || !body || !blogCover) {
      return res.status(400).json({ message: "Please fill all fields" });
    }

    const isExisting = await postModel.findOne({ title: title });

    if (isExisting) {
      return res.status(400).json({ message: "this blog already exist" });
    }

    const blog = await postModel.create({
      author,
      title,
      body,
      blogCover,
      images,
      ratings,
      totalRatings,
      price,
      duration,
      language,
      secretBlog
    });

    return res.status(201).json({
      status: "success",
      data: {
        blog,
      },
    });
});



exports.allBlogs = catchAsync(async (req, res, next) => {

    const features = new APIfeatures(postModel.find(), req.query)
      .sort()
      .filter()
      .limit()
      .paginate();

    let blogs = await features.query;

    return res.status(200).json({
      status: "success",
      requestedAt: req.requestTime,
      result: blogs.length,
      data: {
        blogs,
      },
    });
});

exports.getOne = catchAsync(async (req, res, next) => {

    const id = req.params.id;
    const blog = await postModel.findById(id);

    if (!blog) {
      const error = new AppError("Unable to find blog with this ID", 404)

      return next(error)
    }

     res.status(200).json({
      status: "success",
      data: {
        blog,
      },
    });
  
});

exports.updateBlog = catchAsync(async (req, res, next) => {
  
    const id = req.params.id;
    const blog = await postModel.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true,
      runValidators:true }
    );

    if (!blog) {
      const error = new AppError("Unable to find blog with this ID", 404)

      return next(error)
    }

    return res.status(200).json({
      status: "success",
      data: {
        blog,
      },
    });
 
});


exports.deleteBlog = catchAsync(async (req, res, next) => {
  
    const id = req.params.id;
    const blog = await postModel.findByIdAndDelete(id);

    if (!blog) {
      const error = new AppError("Unable to find blog with this ID", 404)

      return next(error)
    }

    return res.status(204).json({
      status: "success",
      data: null,
    });
 
});


exports.getBlogStats = catchAsync(async (req, res, next) => {
  
    const stats = await postModel.aggregate([
      {
        $match: {
          ratings: { $gte: 4.5 },
        },
      },
      {
        $group: {
          _id: {$toUpper : "$language"},
          totalRating:{$sum: "$totalRatings"},
          avgRating: { $avg: "$ratings" },
          avgPrice: { $avg: "$price" },
          minPrice: { $min: "$price" },
          maxPrice: { $max: "$price" },
          totalPrice: { $sum: "$price" },
          blogCount:{$sum: 1}
        },
      },
      {
        $sort:{
          avgPrice:1
        }
      },
    ]);

    return res.status(200).json({
      status: "success",
      result: stats.length,
      data: {
        stats,
      },
    });
 
});


// exports.getMonthlyPlan = async(req, res) =>{
//   try {

//     const year = req.params.year * 1

//     const plan = await postModel.aggregate([])

//     return res.status(200).json({
//       status: "success",
//       result: plan.length,
//       data: {
//         plan,
//       },
//     });

//   } catch (error) {
//     return res.status(404).json({
//       status: "fail",
//       message: "Failed to aggregate monthly plan",
//       error: error.message,
//     });
//   }
// }
