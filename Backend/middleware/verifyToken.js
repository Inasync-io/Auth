import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
    const token = req.cookies?.token
    // console.log("Extracted token:", token);
    if (!token) {
        console.log("No token found in cookies!");
        return res.status(401).json({ success: false, message: "Unauthorized - No token provided" });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // console.log("Decoded Token: ", decoded);
        
        req.userId = decoded.userId;
        // console.log("Set req.userId:", req.userId);
        next();
    } catch (error) {
        console.log("Error in verifyToken ", error);
        return res.status(500).json({ success: false, message: "Server error"});        
    }
}