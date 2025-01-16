/* eslint-disable */
import { fulfillWithTimeLimit } from '../functions/fulfillWithTimeLimit';
import processVariableMapper from '../functions/processVariablesMapper';
import { linkAttachments } from '../services/anexo/linkAttachments';
import { saveData } from './saveData';
import GLOBAL from './storage.json';

export default function workflowStart(renderApp) {
    workflowCockpit({
        init,
        onSubmit,
        onError
    });


    async function init(data, info) {
        let dadosDoProcesso = {};
        dadosDoProcesso.variaveisProcesso = processVariableMapper(await info.getInfoFromProcessVariables());
        dadosDoProcesso.dadosPlataforma = await info.getPlatformData();
        dadosDoProcesso.usuario = await info.getUserData();
        dadosDoProcesso.novaSolicitacao = await info.isRequestNew();
        dadosDoProcesso.data = data;
        // verifica se getTaskData responde em 500ms. Se não responder é pq a tarefa foi aberta pela aba de "gestão"
        try {
            const timeLimit = 500
            const failureValue = null
            const resTarefaAtiva = await fulfillWithTimeLimit(
                timeLimit,
                info.getTaskData(),
                failureValue
            )
            if (resTarefaAtiva === null) {
                throw new Error('getTaskData não existe')
            } else {
                // faz o link do primeiro anexo
                const taskName = resTarefaAtiva.taskName
                // console.log(dadosDoProcesso.dadosPlataforma.token.access_token,
                //     dadosDoProcesso.variaveisProcesso.idAnexo,
                //     dadosDoProcesso.data.processInstanceId);
                if (!dadosDoProcesso.novaSolicitacao && taskName.search('2') != -1) {
                    if (dadosDoProcesso.variaveisProcesso.idAnexo) {
                        await linkAttachments(
                            dadosDoProcesso.dadosPlataforma.token.access_token,
                            [dadosDoProcesso.variaveisProcesso.idAnexo],
                            dadosDoProcesso.data.processInstanceId
                        )
                    }
                    if (dadosDoProcesso.variaveisProcesso.idAnexo2) {
                        await linkAttachments(
                            dadosDoProcesso.dadosPlataforma.token.access_token,
                            [dadosDoProcesso.variaveisProcesso.idAnexo2],
                            dadosDoProcesso.data.processInstanceId
                        )
                    }
                }
            }
        } catch (e) {
            console.log('Sem resposta de getTaskData: ', e)
        }
        console.log(dadosDoProcesso)
        renderApp(dadosDoProcesso, info, data);
    }

    function onSubmit(data, info) {

        const { tarefaAtiva } = GLOBAL;
        if (tarefaAtiva == 1) {
            return saveData(data, info).tarefa_1();
        } else if (tarefaAtiva == 2) {
            return saveData(data, info).tarefa_2();
        } else if (tarefaAtiva == 3) {
            return saveData(data, info).tarefa_1();
        }
        // else if (tarefaAtiva == 4 || tarefaAtiva == 5) {
        //     return saveData(data).tarefa_4();
        // }
    }

    function onError() {
    }
}