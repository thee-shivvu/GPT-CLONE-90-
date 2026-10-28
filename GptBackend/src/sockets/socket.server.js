const cookie = require('cookie');
const { Server } = require("socket.io")
const jwt = require('jsonwebtoken');
const userModel = require('../models/user.model');
const aiService = require("../services/ai.service")
const messageModel = require("../models/message.model")


function initialSocketServer(httpServer) {
    const io = new Server(httpServer, {})

    // Socket Middleware
    io.use(async (socket, next) => {

        const cookies = cookie.parseCookie(socket.handshake.headers?.cookie || "")

        if (!cookies.token) {
            next(new Error("Authentication error"))
        }
        try {
            const decoded = jwt.verify(cookies.token, process.env.JWT_SECRET)
            const user = await userModel.findById(decoded.id)
            socket.user = user
            next()

        } catch (error) {
            next(new Error(error))
        }
    })

    io.on("connection", (socket) => {

        socket.on("ai-message", async (messagePayload) => {
            try {

                const payload = typeof messagePayload === "string" ? JSON.parse(messagePayload) : messagePayload;

                await messageModel.create({
                    chat: payload.chat,
                    user: socket.user._id,
                    content: payload.content,
                    role: "user"
                })

                const chatHistory = (await messageModel.find({
                    chat: payload.chat
                }).sort({createdAt: -1}).limit(4).lean()).reverse()

                const response = await aiService.generateResponse(chatHistory.map(item => {
                    return {
                        role: item.role,
                        parts: [{ text: item.content }]
                    }
                }));

                await messageModel.create({
                    chat: payload.chat,
                    user: socket.user._id,
                    content: response,
                    role: "model"
                })

                socket.emit("ai-response", {
                    content: response,
                    chat: messagePayload.chat
                });

            } catch (error) {
                console.error("AI message error:", error);

                socket.emit("ai-error", {
                    message: "Failed to generate AI response."
                });
            }
        })

    })
}

module.exports = initialSocketServer