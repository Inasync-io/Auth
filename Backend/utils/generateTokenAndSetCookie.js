import jwt from 'jsonwebtoken';

export const generateTokenAndSetCookie = (res, userId) => {
    // console.log('generateTokenAndSetCookie function is called');
    if (!process.env.JWT_SECRET) {
        console.error('JWT_SECRET is not defined in environment variables!');
        return res.status(500).send('Server error: JWT_SECRET is not defined');
    }
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: "7d",
    })

    res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
    })

    return token;
}

// export const generateOtpVerificationToken = () => {
//     return Math.floor(100000 + Math.random() * 900000).toString();
// };