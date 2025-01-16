import axios from "axios";
import { configServices, defaultInvoke } from "./configServices";

export default async function postAfastamentos(token, afastamentos = []) {
  const config = {
    headers: { Authorization: `bearer ${token}` }
  }

  const body = {
    ...defaultInvoke,
    inputData: {
      ...defaultInvoke.inputData,
      port: 'incluir_afastamentos_multiplos',
      tabela: afastamentos
    }
  }
  let retorno;

  try {
    let { data } = await axios.post(
      configServices.baseUrl,
      body,
      config
    )
    retorno = data?.outputData

  } catch (error) {
    console.log('Erro ao gravar afastamentos', error);
    retorno = error;
  }

  return retorno;
}