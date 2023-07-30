const {instance} = require("../config/razorPay");
const mongoose = require("mongoose");
const Course = require("../models/course");
const User = require("../models/user");
const mailSender = require("../utils/mailSender");
const { courseEnrollmentEmail } = require("../mail/template/courseEnrollment");

// capture the payment
module.exports.capturePayment = async (req, res) => {
    // get courseId and userId
    const{ courseId } = req.body;
    const userId = req.user_id;
    // validation
    if(!courseId) {
        return res.status(401).json({
            succees: false,
            message:"Please provide courseID / select course"
        });
    }
    // valid courseId ans courseDetail
    let course;
    try {
        course = await Course.findById(courseId);
        if(!course) {
            return res.status(401).json({
                succees: false,
                message:"could not find the course"
            });
        }
        // user already pay for the same course
        const uid = new mongoose.Types.ObjectId(userId);
        if(course.studentsEnrolled.includes(uid)) {
            return res.status(200).json({
                success: true,
                message: "Student have already enrolled for the course"
            });
        }
    } catch (err) {
        console.error(err);
        return res.status(401).json({
            succees: false,
            message:"Something went wrong while fetching course"
        });
    }

    const amount = course.price;
    const currency = "INR";

    let options = {
        amount: amount * 100,
        currency: currency,
        reciept: Date.now().toString(),
        notes: {
            courseId: courseId,
            userId 
        }
    };

    // order create ans return response
    try {
        const paymentResponse = await instance.orders.create(options);
        console.log(paymentResponse);
        return res.status(200).json({
            sucess: true,
            courseName: course.courseName,
            courseDescription: course.courseDescription,
            thumbnail: course.thumbnail,
            orderId: paymentResponse.id,
            currency: paymentResponse.currency,
            amount: paymentResponse.amount,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: "Something wemt wrong while creating order"
        });
    }
}

// varifysignature of razorPay order
module.exports.varifySignature = async (req, res) => {
    const webHookSecret = "12345678";
    const signature = req.headers["x-razorpay-signature"];
    const shaSum = crypto.createHmac("sha256", webHookSecret);
    shaSum.update(JSON.stringify(req.body));
    const digest = shaSum.digest("hex"); 

    if(signature === digest) {
        console.log("Payment is authorize");

        const { userId, courseId} = req.boy.payload.payment.entity.notes;

        try {
            // fullfill the action
            // find the course and enrolled the student
            const enrolledCourse = await Course.findByIdAndUpdate(
                courseId,
                { $push: { studentsEnrolled: userId } },
                {new: true},
            );

            const enrolledStudent = await User.findByIdAndUpdate(
                userId,
                { $push: {courses: courseId} },
                {new: true}
            );
            
            // send email
            const emailResponse = await mailSender(
                enrolledStudent.email,
                "Congratulations",
                "You have enrolled in the studynotion course successfully"
            );

            console.log(emailResponse);

            return res.status(200).json({
                success: true,
                message: "You have successfully enrolled into the course",
            });
        } catch (err) {
            console.error(err);
            return res.status(500).json({
                success: false,
                message: err.message,
            });
        }
    } else {
        return res.status(400).json({
            succees: false,
            message: "Invalid request",
        });
    }
}

