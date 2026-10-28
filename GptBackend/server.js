require("dotenv").config()
const app = require("./src/app")
const connectDb = require('./src/db/db')
const initialSocketServer = require('./src/sockets/socket.server')
const httpServer = require('http').createServer(app)


connectDb()
initialSocketServer(httpServer)

httpServer.listen(3000, () => {
    console.log("server is running on port 3000")
})