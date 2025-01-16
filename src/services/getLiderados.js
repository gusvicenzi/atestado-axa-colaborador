import axios from "axios";
import { configServices, defaultInvoke } from "./configServices";

export default async function getLiderados(token, user) {
    const config = {
        headers: { Authorization: `bearer ${token}` }
    }

    const body = {
        ...defaultInvoke,
        inputData: {
            ...defaultInvoke.inputData,
            port: 'liderados',
            nomeusuario: user
        }
    }

    let retorno;
    try {
        const { data } = await axios.post(
            configServices.baseUrl,
            body,
            config
        )
        retorno = data?.outputData?.tabela || [];

        if (retorno && !(retorno instanceof Array)) {
            retorno = [{ ...retorno }]
        }

        retorno = retorno?.map(colab => ({ ...colab, name: `${colab?.numcad} - ${colab?.nomfun}` }))

    } catch (error) {
        retorno = error;
        console.log(error);
    }
    return retorno;
}