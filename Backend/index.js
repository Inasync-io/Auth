import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from "cookie-parser";
import { connectDB } from './db/connectDB.js';
import authRouters from './routes/authRoute.js';

dotenv.config();

const app = express();
// const PORT = process.env.PORT || 5000

// Connect DB on cold start
connectDB();

app.use(cors({
    // origin: "http://localhost:3000", 
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"], 
    credentials: true             
  }));

app.use(express.json()); // allows us to parse incoming requests:req.body
app.use(cookieParser()); // allows us to parse incoming cookies

app.get("/", (req, res) => {
  res.status(200).json({
    code: 200,
    status: "Live",
    project_name: "Node - Auth",
    developed_by: "https://github.com/Inasync-io"
  });
});

app.use("/api", authRouters);

// app.listen(PORT, () => {
//     connectDB();
//     console.log(`Server is running on port ${PORT}`);
// })

module.exports = app;

export default app;
