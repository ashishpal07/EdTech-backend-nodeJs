const SubSection = require("../models/subSection");
const Section = require("../models/section");
const { imageUploadToCloudinary } = require("../utils/imageUploader");

module.exports.createSubsection = async (req, res) => {
  try {
    const { sectionId, title, timeDuration, description } = req.body;

    const video = req.files.videoFile;

    if (!sectionId || !title || !timeDuration || !description || !video) {
      return res.status(402).json({
        success: false,
        message: "All fields are required",
      });
    }

    const uploadDetails = await imageUploadToCloudinary(
      video,
      process.env.FOLDER_NAME
    );

    const subsection = await SubSection.create({
      title: title,
      description: description,
      timeDuration: timeDuration,
      videoUrl: uploadDetails.secure_url,
    });

    await Section.findByIdAndUpdate(
      sectionId,
      {
        $push: {
          subSection: subsection._id,
        },
      },
      { new: true }
    );

    // log updated section here after adding populated

    return res.status(201).json({
      success: true,
      message: "Subsection created successfully",
      subsection,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: true,
      message: "Something went erong while creating Subsection",
    });
  }
};

// HW : update Subsection  [not tested]
exports.updateSubSection = async (req, res) => {
  try {
    const { sectionId, title, description } = req.body;
    const subSection = await SubSection.findById(sectionId);

    if (!subSection) {
      return res.status(404).json({
        success: false,
        message: "SubSection not found",
      });
    }

    if (title !== undefined) {
      subSection.title = title;
    }

    if (description !== undefined) {
      subSection.description = description;
    }
    if (req.files && req.files.video !== undefined) {
      const video = req.files.video;

      const uploadDetails = await imageUploadToCloudinary(
        video,
        process.env.FOLDER_NAME
      );

      subSection.videoUrl = uploadDetails.secure_url;
      subSection.timeDuration = `${uploadDetails.duration}`;
    }

    await subSection.save();

    return res.json({
      success: true,
      message: "Section updated successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while updating the section",
    });
  }
};

// HW : Delete Subsection  [not tested]
exports.deleteSubSection = async (req, res) => {
  try {
    const { subSectionId, sectionId } = req.body;
    await Section.findByIdAndUpdate(
      { _id: sectionId },
      {
        $pull: {
          subSection: subSectionId,
        },
      }
    );
    const subSection = await SubSection.findByIdAndDelete({
      _id: subSectionId,
    });

    if (!subSection) {
      return res
        .status(404)
        .json({ success: false, message: "SubSection not found" });
    }

    return res.json({
      success: true,
      message: "SubSection deleted successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while deleting the SubSection",
    });
  }
};
