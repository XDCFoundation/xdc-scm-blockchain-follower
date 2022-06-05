import BlockManager from "./blockManager";


export default class BlockController {
    static async listenBlocks(web3Instance , socketIO) {
        lhtWebLog("BlockController:listenBlocks", "");
        await new BlockManager().listenBlocks(web3Instance , socketIO);
    }

}
