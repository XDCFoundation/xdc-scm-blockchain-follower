import APP from "express";
import DBConnection from "./config/dbConnection";
import Utils from "./app/utils";
import Config from "./config";
import routes from "./routes";
import {httpConstants} from "./app/common/constants";

const app = new APP();
require("./config/express")(app);
import BlockController from "./app/modules/block";
import WebSocketService from "./app/service/WebsocketService";
import AMQP from "./library";
const IOSocket = require('socket.io');

global.lhtWebLog = Utils.lhtLog;
process.on('unhandledRejection', error => {
    // Will print "unhandledRejection err is not defined"
    console.log('unhandledRejection', error.message);
});
class Server {
    static listen() {
        Promise.all([DBConnection.connect(), AMQP.conn(Config.AMQP_HOST_URL, true)])
            .then(async () => {
                routes(app);
                let server = app.listen(Config.PORT);
                let socketIO = IOSocket(server, {
                    cors: {
                        origin: Config.ORIGIN_URL,
                        methods: ["GET", "POST"],
                        allowedHeaders: ["*"],
                        credentials: true
                    }
                });
                global.web3 = await WebSocketService.webSocketConnection(Config.WS_URL);
                socketIO.on('connection', (socket) => {
                    socket.on('Connected', () => {
                        Utils.lhtLog("listen", `socket connected`, {}, "Developer", httpConstants.LOG_LEVEL_TYPE.INFO);
                    })
                });
                await BlockController.listenBlocks(web3 , socketIO);
                Utils.lhtLog("listen", `Server Started on port ${Config.PORT}`);
            })
            .catch((error) => {
                global.web3 = WebSocketService.webSocketConnection(Config.WS_URL);
                console.log(error);
                Utils.lhtLog("listen", "Failed to connect", {err: error}, "Developer", httpConstants.LOG_LEVEL_TYPE.ERROR)
            });
    }
}

Server.listen();
