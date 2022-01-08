import BlockManager from "./blockManager";


export default class BlockController {
    static async listenBlocks(socket) {
        await new BlockManager().listenBlocks(socket);
    }

}
