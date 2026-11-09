
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendOTPEmail = async (email, otp) => {
    await transporter.sendMail({
        from: `"FixNear" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "FixNear - Password Reset OTP",
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
                <h2 style="color: #247c4b;">FixNear</h2>
                <h3>Password Reset Request</h3>
                <p>Your OTP for resetting your FixNear password is:</p>
                <h1 style="letter-spacing: 8px; color: #247c4b;">
                    ${otp}
                </h1>
                <p>This OTP is valid for 5 minutes.</p>
                <p>If you did not request a password reset, please ignore this email.</p>
                <br/>
                <p>Regards,<br/>FixNear Team</p>
            </div>
        `
    });
};

module.exports = { sendOTPEmail };
