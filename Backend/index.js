import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from "cookie-parser";
import { connectDB } from './db/connectDB.js';
import authRouters from './routes/authRoute.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT

connectDB();

app.use(cors({
    origin: "http://localhost:3000", 
    methods: ["GET", "POST", "PUT", "DELETE"], 
    credentials: true             
  }));

app.use(express.json()); // allows us to parse incoming requests:req.body
app.use(cookieParser()); // allows us to parse incoming cookies

app.get("/", (_req, res) => {
  res.status(200).json({
    code: 200,
    status: "Live",
    project_name: "Node - Auth",
    developed_by: "https://github.com/Inasync-io"
  });
});

app.use("/api", authRouters);

// if (process.env.NODE_ENV !== "dev") {
//   app.listen(PORT, () => {
//     console.log(`🚀 Server running at http://localhost:${PORT}`);
//   });
// }

export default async function handler(req, res) {
  await app(req, res);
}

