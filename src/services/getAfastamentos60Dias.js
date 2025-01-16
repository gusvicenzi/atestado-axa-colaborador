import axios from "axios";
import { configServices, defaultInvoke } from "./configServices";

export default async function getAfastamentos60Dias(token, usuario, dataAfastamento = '') {
    const config = {
        headers: { Authorization: `bearer ${token}` }
    }

    const body = {
        ...defaultInvoke,
        inputData: {
            ...defaultInvoke.inputData,
            port: 'consulta_afastamento_atestado',
            numemp: usuario.numemp,
            tipcol: usuario.tipcol,
            numcad: usuario.numcad,
            datafa: dataAfastamento
        }
    }

    let retorno;
    try {
        const { data } = await axios.post(
            configServices.baseUrl,
            body,
            config
        )

        let lista = data?.outputData?.lista || []

        if (!(lista instanceof Array)) lista = [lista]

        retorno = {
            lista: lista,
            datult: data?.outputData?.datult
        }
        return retorno;
    } catch (error) {
        retorno = error;
        console.log(error);
    }
    return retorno;
}