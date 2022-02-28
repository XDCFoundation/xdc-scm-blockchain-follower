import Config from "../../../config";
import AMQPController from "../../../library";
import {amqpConstants, httpConstants} from "../../common/constants";
import XdcService from "../../service/xdcService";

export default class TransactionManager {
    async syncTransaction(web3Instance, transactions, timestamp) {
        if (!transactions || transactions.length <= 0 || !web3Instance) {
            lhtWebLog("syncTransaction", "Error in syncTransaction", {web3Instance, transactions}, "AyushK", "ERROR")
            return;
        }
        let txnList = await this.getLastTransactions(web3Instance, transactions, timestamp);
        if (!txnList || !txnList.length) return;
        await AMQPController.insertInQueue(Config.TRANSACTION_EXCHANGE, Config.TRANSACTION_QUEUE, "", "", "", "", "", amqpConstants.exchangeType.FANOUT, amqpConstants.queueType.PUBLISHER_SUBSCRIBER_QUEUE, {
            operationType: "BLOCK_RECEIVED_FROM_FOLLOWER",
            payload: txnList
        });
    }

    async getLastTransactions(web3Instance, transactions, timestamp) {
        let txnList = [];
        let txData;
        for (txData of transactions) {
            const receipt = await web3Instance.eth.getTransactionReceipt(txData.hash);
            const tx = await this.normalizeTX(txData, receipt, timestamp);
            tx.contractAddress = tx.contractAddress || tx.to;
            tx.transactionFee = Number(tx.gasPrice) * tx.gasUsed;
            txnList.push(tx)
        }
        let contractArray = txnList.map(({contractAddress}) => contractAddress)
        contractArray = new Set(contractArray);
        lhtWebLog("getLastTransactions", `Txn received for `, contractArray)
        const SCMSystemContracts = await XdcService.getSCMSystemContracts(contractArray)
        if (!SCMSystemContracts || !SCMSystemContracts.length) return []
        lhtWebLog("getLastTransactions", `Saving Txn for `, SCMSystemContracts)
        txnList = txnList.filter(txnObj => SCMSystemContracts.includes(txnObj.contractAddress))
        return txnList;
    }

    async normalizeTX(txData, receipt, timestamp) {
        if (!txData || !receipt || !timestamp) return;

        let contractAddress = "";
        if (receipt && receipt.contractAddress !== null) {
            contractAddress = receipt.contractAddress.toLowerCase();
        }

        let cumulativeGasUsed = 0;
        if (receipt && receipt.cumulativeGasUsed) cumulativeGasUsed = receipt.cumulativeGasUsed;

        let logs = [];
        if (receipt && receipt.logs.length > 0) logs = receipt.logs;

        let status = true;
        if (receipt && receipt.status) {
            status = receipt.status;
        }

        const tx = {
            blockHash: txData.blockHash || "",
            blockNumber: txData.blockNumber || 0,
            hash: txData.hash.toLowerCase() || "",
            from: txData.from.toLowerCase() || "",
            to: txData.to || "",
            gas: txData.gas || "",
            gasPrice: String(txData.gasPrice) || "",
            gasUsed: receipt.gasUsed || 0,
            input: txData.input || "",
            nonce: txData.nonce || 0,
            transactionIndex: txData.transactionIndex || 0,
            value: txData.value || "",
            r: txData.r || "",
            s: txData.s || "",
            v: txData.v || "",
            contractAddress: contractAddress || "",
            cumulativeGasUsed: cumulativeGasUsed || 0,
            logs: logs || [],
            status: status || false,
            timestamp: timestamp || 0,
            modifiedOn: Date.now(),
            createdOn: Date.now(),
            isDeleted: false,
            isActive: true,
        };

        if (txData.to) {
            tx.to = txData.to.toLowerCase() || "";
            return tx;
        } else if (txData.creates) {
            tx.creates = txData.creates.toLowerCase() || "";
            return tx;
        } else {
            tx.creates = receipt.contractAddress.toLowerCase() || "";
            return tx;
        }
    }
}
