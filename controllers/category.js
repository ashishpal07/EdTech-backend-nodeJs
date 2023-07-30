const Category = require("../models/category");

module.exports.createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name || !description) {
      return res.status(401).json({
        success: false,
        message: "All fields are require",
      });
    }

    let category = await Category.create({
      name: name,
      description: description,
    });

    return res.status(201).json({
      success: true,
      category: category,
      message: "Category created successfully",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while creating category",
    });
  }
};

// get all categories
module.exports.showAllCategory = async (req, res) => {
  try {
    const category = await Category.find({}, { name: true, description: true });

    return res.status(200).json({
      success: true,
      category,
      message: "All categories shown succeffully",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while showing all categories",
    });
  }
};


// category page details
module.exports.categoryPageDetails = async (req, res) => {
  try {

    // category id
    const { categoryId } = req.body;

    // get courses for specified category id
    const selectedCategory = await Category.findById(categoryId).populate("course").exec();

    if(!selectedCategory) {
      return res.status(404).json({
        success: false,
        message: "No courses available"
      });
    }

    // get courses for different category
    const differentCategory = await Category.find({ _id: { $ne: categoryId } })
      .populate("course")
      .exec();

    // get 10 top selling courses
    // HW - Do it by you own

    return res.status(200).json({
      success: true,
      selectedCategory,
      differentCategory
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while finding categoryPageDetails"
    });
  }
}

