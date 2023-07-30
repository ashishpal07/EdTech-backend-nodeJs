const RatingAndReview = require("../models/ratingAndReview");
const Course = require("../models/course");
const mongoose = require("mongoose");

// create rating and review
module.exports.createRating = async (req, res) => {
  try {
    // get userid
    const userId = req.user._id;
    // fetch data from req body
    const { rating, review, courseId } = req.body;
    // check user is enrolled or not
    const courseDetails = await Course.findOne(
      { _id: courseId },
      { studentsEnrolled: { $elemMetch: { $eq: userId } } }
    );

    if (!courseDetails) {
      return res.status(401).json({
        success: false,
        message: "Student not enrolled in the course",
      });
    }
    // check if user is already reviewd
    const alreadyReviewd = await RatingAndReview.findOne({
      user: userId,
      course: courseId,
    });
    if (alreadyReviewd) {
      return res.status(401).json({
        success: false,
        message: "You have already reviewed this course",
      });
    }
    // create rating
    const ratingnew = await RatingAndReview.create({
      rating,
      review,
      course: courseId,
      user: userId,
    });
    // add rating to course
    await Course.findByIdAndUpdate(
      courseId,
      {
        $push: {
          ratingAndReviews: ratingnew._id,
        },
      },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "successfully rating created",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while creating review rating",
    });
  }
};

// find average rating
module.exports.getAvgRating = async (req, res) => {
  try {
    const courseId = req.body.courseid;
    const result = await RatingAndReview.aggregate([
      {
        $match: {
          course: new mongoose.Types.ObjectId(courseId),
        },
      },
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$rating" },
        },
      },
    ]);

    if (result.length > 0) {
      return res.status(200).json({
        success: true,
        averageRating: result[0].averageRating,
      });
    }

    return res.status(200).json({
      success: true,
      averageRating: 0,
      message: "Node of rating is given",
    });
  } catch {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while getting avg rating",
    });
  }
};

// get all review
module.exports.getAllRating = async (req, res) => {
  try {
    const allReviews = await RatingAndReview.find({})
      .sort({ rating: "desc" })
      .populate({
        path: "user",
        select: "firstName lastName email, image",
      })  
      .populate({
        path: "course",
        select: "courseName",
      })
      .exec();

    return res.status().json({
      success: true,
      message: "All reviews fetched successfully",
      data: allReviews,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Something went wrong getting all ratings",
    });
  }
};
