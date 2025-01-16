import axios from 'axios';
import { configServices, defaultInvoke } from './configServices';

export default async function getListaSituacoes(token) {
    const config = {
        headers: { Authorization: `bearer ${token}` }
    }

    const body = {
        ...defaultInvoke,
        inputData: {
            ...defaultInvoke.inputData,
            port: 'consulta_situacao_bpm_atestado',
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

        retorno = lista
    } catch (error) {
        retorno = error
        console.log(error)
    }
    return retorno;
}