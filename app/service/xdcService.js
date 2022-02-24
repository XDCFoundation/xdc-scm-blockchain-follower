import {httpConstants} from "../common/constants";
import HTTPService from "./http-service";
import Config from "../../config"

export default class XdcService {

    static async getSCMSystemContracts(contractArray) {
        const systemContractsResponse = await HTTPService.executeHTTPRequest(httpConstants.METHOD_TYPE.POST, Config.CONTRACT_SERVICE_BASE_URL, "scm-contracts", {contracts: contractArray});
        return !systemContractsResponse || !systemContractsResponse.success ? null : systemContractsResponse.responseData;
    }
}
