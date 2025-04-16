import twilio from "twilio";
import dotenv from "dotenv";

dotenv.config();

const accountSid = process.env.ACCOUNT_SID;
const authToken = process.env.AUTH_TOKEN;
const serviceSid = process.env.SERVICE_SID;

const client = twilio(accountSid, authToken);

export const sendOtp = async (phone) => {
    try {
        const verification = await client.verify.v2
            .services(serviceSid)
            .verifications.create({ to: phone, channel: "sms" });

        console.log(`OTP sent to ${phone}, SID: ${verification.sid}`);
        return { success: true, message: "OTP sent successfully" };

    } catch (error) {
        console.error("Error sending OTP:", error.message);
        throw new Error("Failed to send OTP. Please try again.");
    }
};
