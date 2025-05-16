import {
  PASSWORD_RESET_REQUEST_TEMPLATE,
  PASSWORD_RESET_SUCCESS_TEMPLATE,
  VERIFICATION_EMAIL_TEMPLATE,
} from "./emailTemplates.js";
import { sender, transport } from "./mailTrapConfig.js";

export const sendVerificationEmail = async (identifier, verificationToken) => {
  const recipient = identifier;
  console.log("recipient: ", recipient);

  try {
    const response = await transport.sendMail({
      from: sender,
      to: recipient,
      subject: "verify your email",
      html: VERIFICATION_EMAIL_TEMPLATE.replace(
        "{verificationCode}",
        verificationToken
      ),
      category: "Email verification",
    });
    // console.log("VerificationToken: ", verificationToken);

    console.log("Email sent successfully", response);
  } catch (e) {
    console.error(`Error sending verification`, e);
    throw new Error(`Error sending verification email: ${e}`);
  }
};

export const sendWelcomeEmail = async (identifier, name) => {
  const recipient = identifier;
  console.log("recipient: ", recipient);

  try {
    const res = await transport.sendMail({
      from: sender,
      to: recipient,
      subject: "Welcome to FeOs Tech!",
      html: `<p>Hello ${name}, welcome to <strong>FeOs Tech</strong>!</p>`,
      //   template_uuid: "d231e96a-784e-41f1-a97e-5eaace8e19ca",
      //   template_variables: {
      //     company_info_name: "FeOs Tech",
      //     name: name,
      //   },
    });

    console.log("Welcome email sent successfully.", res);
  } catch (e) {
    console.error(`Error sending welcome email`, e);
    throw new Error(`Error sending welcome email: ${e.message}`);
  }
};

export const sendPasswordResetEmail = async (identifier, resetURL) => {
  const recipient = identifier;

  try {
    const res = await transport.sendMail({
      from: sender,
      to: recipient,
      subject: "Reset your password",
      html: PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", resetURL),
      category: "Password Reset",
    });

    console.log("Password reset email sent successfully.", res);
  } catch (error) {
    console.error("Error sending password reset email", error);

    throw new Error(`Error sending password reset email: ${error}`);
  }
};

export const sendResetSuccessEmail = async (identifier) => {
  const recipient = identifier;

  try {
    const res = await transport.sendMail({
      from: sender,
      to: recipient,
      subject: "Password reset successfully",
      html: PASSWORD_RESET_SUCCESS_TEMPLATE,
      category: "Password Reset",
    });

    console.log("Password reset email sent successfully.", res);
  } catch (error) {
    console.error("Error sending password reset success email", error);

    throw new Error(`Error sending password reset success email: ${error}`);
  }
}
