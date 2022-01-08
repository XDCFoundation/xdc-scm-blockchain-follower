import {  httpConstants } from "../../common/constants";
import Utils from "../../utils";
import Transaction from "../transaction/index";
const fs = require('fs');
let newBlocks;
export default class BlockManager {
    async listenBlocks(socket) {
        try {
            newBlocks = web3.eth.subscribe("newBlockHeaders", (error, result) => {
                if (!error) {
                    return false;
                }
            });
            newBlocks.on("data", (blockHeader) => {
                web3.eth.getBlock(blockHeader.hash, true, async (error, blockData) => {
                    if (!blockData)
                        return;
                    // Utils.lhtLog("listenBlocks", `listenBlocks getBlocksFromBlockChainNetwork `, blockData, "", httpConstants.LOG_LEVEL_TYPE.INFO);
                    let blockSocketData = {
                        totalDifficulty: blockData.totalDifficulty,
                        number: blockData.number,
                        transactions: blockData.transactions,
                        timestamp: blockData.timestamp,
                        hash: blockData.hash,
                        difficulty: blockData.difficulty,
                        gasUsed: blockData.gasUsed
                    };
                    console.log(blockSocketData) // To check BlockSocketData object
                    try {
                        if (typeof socket !== "undefined") {
                            socket.emit("block-socket", blockSocketData);
                        }
                    } catch (err) {
                        Utils.lhtLog("listenBlocks", `listenBlocks block-socket catch `, err, "", httpConstants.LOG_LEVEL_TYPE.INFO);
                    }
                    if (!blockData.transactions || blockData.transactions.length <= 0)
                        return;
                    Transaction.syncTransaction(blockData.transactions, blockData.timestamp, socket);
                });
            });
            newBlocks.on("error", (error) => {
                console.log("subscription error", error);
                newBlocks = web3.eth.subscribe("newBlockHeaders", (error, result) => {
                    if (!error) {
                        return false;
                    }
                });
            });
        } catch (err) {
            console.log("subscription catch", error);
        }
    }

}

const delay = ms => new Promise(res => setTimeout(res, ms));