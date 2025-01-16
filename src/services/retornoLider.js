import axios from "axios";
import { configServices, defaultInvoke } from "./configServices";

export default async function retornoLider(token, user) {
    const config = {
        headers: { Authorization: `bearer ${token}` }
    }

    const body = {
        ...defaultInvoke,
        inputData: {
            ...defaultInvoke.inputData,
            port: 'retorno_lider',
            solicitante: user
        }
    }

    let retorno;
    try {
        const { data } = await axios.post(
            configServices.baseUrl,
            body,
            config
        )
        const response = data?.outputData

        console.log('response', response);


        retorno = {
            usuario: {
                nomfun: response?.nomfun,
                solicitante: response?.solicitante,
                numcad: response?.numcad,
                numemp: response?.numemp,
                tipcol: response?.tipcol
            },
            empresa: {
                numemp: response?.numemp,
                codfil: response?.codfil,
                nomfil: response?.nomfil
            }
        }
        console.log('retorno', retorno);

    } catch (error) {
        retorno = error;
        console.log(error);
    }
    return retorno;
}