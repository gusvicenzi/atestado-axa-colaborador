import axios from "axios";
import { configServices, defaultInvoke } from "./configServices";

export default async function getCID(token, cid) {
    const config = {
        headers: { Authorization: `bearer ${token}` }
    }

    const body = {
        ...defaultInvoke,
        inputData: {
            ...defaultInvoke.inputData,
            port: 'consulta_cid',
            coddoe: cid
        }
    }

    let retorno;
    try {
        let { data } = await axios.post(
            configServices.baseUrl,
            body,
            config
        )

        retorno = data?.outputData;
        if (retorno?.desdoe) {
            retorno = { codcid: cid, descid: retorno.desdoe }
        }

    } catch (error) {
        console.log('Erro ao buscar CID', error)
        retorno = error;
    }
    return retorno;
}