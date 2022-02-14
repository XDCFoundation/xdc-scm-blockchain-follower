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

global.lhtWebLog = Utils.lhtLog;

class Server {
    static listen() {
        Promise.all([DBConnection.connect(), AMQP.conn(Config.AMQP_HOST_URL, true)])
            .then(async () => {
                routes(app);
                app.listen(Config.PORT);
                global.web3 = await WebSocketService.webSocketConnection(Config.WS_URL);
                await BlockController.listenBlocks(web3);
                Utils.lhtLog("listen", `Server Started on port ${Config.PORT}`);
            })
            .catch((error) => {
                global.web3 = WebSocketService.webSocketConnection(Config.WS_URL);
                Utils.lhtLog("listen", "Failed to connect", {err: error}, "Developer", httpConstants.LOG_LEVEL_TYPE.ERROR)
            });
    }
}

Server.listen();
