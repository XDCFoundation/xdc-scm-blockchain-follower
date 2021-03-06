import {httpConstants} from "../../common/constants";
import TransactionController from "../transaction";

let newBlocks;
export default class BlockManager {
    async listenBlocks(web3Instance) {
        try {
            await startListener(web3Instance);
            listenEvents(web3Instance);
        } catch (error) {
            lhtWebLog("listenBlocks error", "Error in newBlockHeaders subscriber", error, "AyushK", "ERROR")
        }
    }
}
const startListener = (web3) => {
    newBlocks = web3.eth.subscribe("newBlockHeaders", (error, result) =>
        error && lhtWebLog("listenBlocks", "Unable to subscribe for newBlockHeaders", error, "AyushK", "ERROR"));
}

const listenEvents = (web3Instance) => {
    newBlocks.on("data", (blockHeader) => processBlockHeader(blockHeader, web3Instance));
    newBlocks.on("error", (error) => {
        lhtWebLog("listenBlocks error", "Error in newBlockHeaders subscriber", error, "AyushK", "ERROR");
        startListener()
    });
}

const processBlockHeader = (blockHeader, web3Instance) => {
    web3Instance.eth.getBlock(blockHeader.hash, true, async (error, blockData) => {
        if (!blockData)
            return;
        let blockSocketData = {
            totalDifficulty: blockData.totalDifficulty,
            number: blockData.number,
            transactions: blockData.transactions,
            timestamp: blockData.timestamp,
            hash: blockData.hash,
            difficulty: blockData.difficulty,
            gasUsed: blockData.gasUsed
        };
        // console.log(blockSocketData) // To check BlockSocketData object
        if (!blockData.transactions || blockData.transactions.length <= 0)
            return;
        await TransactionController.syncTransaction(web3Instance, blockData.transactions, blockData.timestamp);
    });
}

const delay = ms => new Promise(res => setTimeout(res, ms));
