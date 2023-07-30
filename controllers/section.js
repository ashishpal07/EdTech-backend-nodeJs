const Section = require("../models/section");
const Course = require("../models/course");

module.exports.createSection = async (req, res) => {
  try {
    // get all data from req.body
    const { sectionName, courseId } = req.body;
    // validate all the data
    if (!sectionName || !courseId) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }
    // create section
    const section = await Section.create({ sectionName });
    // push section id into course
    await Course.findByIdAndUpdate(
      courseId,
      {
        $push: {
          courseContent: section._id,
        },
      },
      { new: true }
    );
    // HW : use populate section and subsection both in update course
    // return response
    return res.status(201).json({
      success: true,
      message: "Section created successfully",
      section,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while creating section",
      error: err.message,
    });
  }
};

module.exports.updateSection = async (req, res) => {
  try {
    const { sectionName, sectionId } = req.body;
    if (!sectionName || !sectionId) {
      return res.status(401).json({
        success: false,
        message: "All fields are require",
      });
    }

    const section = await Section.findByIdAndUpdate(
      sectionId,
      { sectionName },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "section updated successfully",
      section,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while updating section",
      error: err.message,
    });
  }
};

module.exports.deleteSection = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("section id = ", id);

    await Section.findByIdAndDelete(id);
    // TODO[Testing] : "Do we need to delete section id from course"

    return res.status(200).json({
      success: true,
      message: "Section deleted successfully",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while deleting section",
      error: err.message,
    });
  }
};
