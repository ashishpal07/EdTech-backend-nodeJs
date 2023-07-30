const express = require("express");
const route = express.Router();

const CategoryController = require("../controllers/category");
const CourseController = require("../controllers/course");
const SectionController = require("../controllers/section");
const SubSectionController = require("../controllers/subSection");
const RatingAndReviewController = require("../controllers/ratingAndReview");
const AuthMiddleware = require("../middlewares/auth");

// *********************************************************************************************
//                              Course routes
// *********************************************************************************************

// Course can only be created by instructor
route.post(
  "/createCourse",
  AuthMiddleware.authenticate,
  AuthMiddleware.isInstructor,
  CourseController.createCourse
);

// Add a section to a course
route.post(
  "/addSection",
  AuthMiddleware.authenticate,
  AuthMiddleware.isInstructor,
  SectionController.createSection
);

// Update a section
route.post(
  "/updateSection",
  AuthMiddleware.authenticate,
  AuthMiddleware.isInstructor,
  SectionController.updateSection
);

// Delete Section
route.post(
  "/deleteSection/:id",
  AuthMiddleware.authenticate,
  AuthMiddleware.isInstructor,
  SectionController.deleteSection
);

// Add subsection
route.post(
  "/addSubSection",
  AuthMiddleware.authenticate,
  AuthMiddleware.isInstructor,
  SubSectionController.createSubsection
);

// Update subsection
route.post(
  "/updateSubSection",
  AuthMiddleware.authenticate,
  AuthMiddleware.isInstructor,
  SubSectionController.updateSubSection
);

// Delete subsection
route.post(
  "/deleteSubSection",
  AuthMiddleware.authenticate,
  AuthMiddleware.isInstructor,
  SubSectionController.deleteSubSection
);

// get course details
route.post(
  "/getCourseDetails",
  CourseController.getCourseDetail
);

// *********************************************************************************************
//                              Category routes only by admins
// *********************************************************************************************

// Category can Only be Created by Admin
route.post(
  "/createCategory",
  AuthMiddleware.authenticate,
  AuthMiddleware.isAdmin,
  CategoryController.createCategory
);

route.get("/showAllCategories", CategoryController.showAllCategory);

route.post("/getCategoryPageDetails", CategoryController.categoryPageDetails);

// *********************************************************************************************
//                              Rating and review
// *********************************************************************************************

route.post(
  "/createRating",
  AuthMiddleware.authenticate,
  AuthMiddleware.isStudent,
  RatingAndReviewController.createRating
);

route.get("/getAverageRating", RatingAndReviewController.getAvgRating);

route.get("/getReviews", RatingAndReviewController.getAllRating);

module.exports = route;
