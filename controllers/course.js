const Course = require("../models/course");
const Category = require("../models/category");
const User = require("../models/user");
const { imageUploadToCloudinary } = require("../utils/imageUploader");

// create course
module.exports.createCourse = async (req, res) => {
  try {
    // Here category is categoryId
    const { courseName, courseDescription, whatYouWillLearn, price, category } =
      req.body;
    let thumbnail = req.files.thumbnail;

    // validation
    if (
      !courseName ||
      !courseDescription ||
      !whatYouWillLearn ||
      !price ||
      !category ||
      !thumbnail
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are require",
      });
    }

    // Check if the user is an instructor
    const instructorDetails = await User.findById(req.user.id, {
      accountType: "Instructor",
    });

    if (!instructorDetails) {
      return res.status(400).json({
        success: false,
        message: "Instructor details not found",
      });
    }

    // check category is valid
    const categoryDetails = await Category.findById(category);
    if (!categoryDetails) {
      return res.status(400).json({
        success: false,
        message: "Category details not found",
      });
    }

    // uload image on cloudinary
    const thumbnailImage = await imageUploadToCloudinary(
      thumbnail,
      process.env.FOLDER_NAME
    );

    // create course
    const newCourse = await Course.create({
      courseName,
      courseDescription,
      instructor: req.user.id,
      whatYouWillLearn: whatYouWillLearn,
      price: price,
      category: categoryDetails._id,
      thumbnail: thumbnailImage.secure_url,
    });

    // add new course to userschema of instructor
    await User.findByIdAndUpdate(
      req.user.id,
      {
        $push: {
          courses: newCourse._id,
        },
      },
      { new: true }
    );

    // update category schema
    const updateCategory = await Category.findByIdAndUpdate(
      categoryDetails._id,
      {
        $push: {
          course: newCourse._id,
        },
      },
      { new: true }
    );

    // return response
    return res.status(201).json({
      success: true,
      message: "Course created successfully",
      newCourse,
      updateCategory,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      error: err.message,
      message: "Something went wrong while creating course",
    });
  }
};

// get all courses
module.exports.showAllCourses = async (req, res) => {
  try {
    const courses = await Course.find({}).populate("instructor").exec();
    return res.status(200).json({
      success: true,
      courses,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong ehile fetching all courses",
    });
  }
};

// get course details
module.exports.getCourseDetail = async (req, res) => {
  try {
    // get course id
    const { courseId } = req.body;

    // find course details
    const courseDetails = await Course.findById(courseId)
      .populate({
        path: "instructor",
        populate: {
          path: "additionalDetails",
        },
      })
      .populate("ratingAndReviews")
      .populate("category")
      .populate({
        path: "courseContent",
        populate: {
          path: "subSections",
        },
      })
      .exec();

    if (!courseDetails) {
      return res.status(400).json({
        success: false,
        message: `Could not find the course with the course id ${courseId}`,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Course details fetched successfully",
      courseDetails,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "something went wrong while fetching complete course details",
    });
  }
};
