import Nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

export const transport = Nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sender = {
  address: process.env.SMTP_USER,
  name: "Ace",
};


// import Nodemailer from "nodemailer";
// import { MailtrapTransport } from "mailtrap";
// import dotenv from "dotenv";

// dotenv.config();

// const TOKEN = process.env.MAILTRAP_TOKEN;

// export const transport = Nodemailer.createTransport(
//   MailtrapTransport({
//     // token: process.env.MAILTRAP_TOKEN,
//     token: TOKEN,
//   })
// );

// export const sender = {
//   address: "hello@demomailtrap.co",
//   name: "Ace",
// };