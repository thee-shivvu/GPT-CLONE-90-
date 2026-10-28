const userModel = require('../models/user.model')
const jwt = require('jsonwebtoken')

const authUser = async (req, res, next) => {
    const { token } = req.cookies

    if (!token) return res.status(401).json({ message: "Access is denied" })

    try {
        const decode = jwt.verify(token, process.env.JWT_SECRET)

        const user = await userModel.findById(decode.id).select("-password")

        req.user = user
        next()

    } catch (error) {
        res.status(401).json({ message: "Access is denied" })
    }
}

module.exports={
    authUser
}
