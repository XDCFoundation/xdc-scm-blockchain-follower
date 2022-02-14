import BlockManager from "./blockManager";


export default class BlockController {
    static async listenBlocks(web3Instance) {
        await new BlockManager().listenBlocks(web3Instance);
    }

}
