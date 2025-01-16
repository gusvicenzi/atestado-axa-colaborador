/* eslint-disable */
import findSring from '../functions/findString'
import { setMessage } from '../globalState'
import postAfastamentos from '../services/postAfastamentos'
import GLOBAL from './storage.json'
// import { linkAttachments } from '../services/anexo/linkAttachments'
import { sendAnexo } from '../functions/sendAnexo'

export function saveData(data, info) {
    let invalidForm = false;
    function validation() {
        document.querySelectorAll(`.obrigatorio`).forEach((field) => {
            if (field.children.length) {
                if (!field.querySelector('.p-inputtext').innerHTML && !field.querySelector('.p-inputtext').value) {
                    field.classList.add('p-invalid');
                    invalidForm = true;
                } else {
                    field.classList.remove('p-invalid');
                }
            } else {
                if (!field.value) {
                    field.classList.add('p-invalid');
                    invalidForm = true;
                } else {
                    field.classList.remove('p-invalid');
                }
            }
        })
    }

    const saveStop = () => {
        throw new Error('Formulario Invalido')
    }


    async function tarefa_1() {
        validation();
        const taskData = GLOBAL.tarefa_1;
        const tarefaAtiva = GLOBAL.tarefaAtiva;
        if (!taskData.anexo && !taskData.anexo2) {
            setMessage({ severity: 'error', summary: 'Formulário Inválido! O campo "Anexo Atestado / Afastamento" é obrigatório', life: 10000 });
            saveStop();
        }
        if (!invalidForm) {
            let retorno = {
                dataInicioAfastamento: taskData.dataInicio,
                horaInicio: taskData?.horaInicio,
                dataTerminoAfastamento: taskData.dataTermino,
                horaTermino: taskData?.horaTermino,
                quantidadeDiasAfastamento: taskData.quantidadeDias,
                descricaoSituacao: taskData.situacao.dessit,
                codigoSituacao: taskData.situacao.codsit,
                descricaoAfastamento: taskData.descricaoAfastamento,
                // nomeSolicitante: taskData.usuario.nomfun,
                // cadastroSolicitante: taskData.usuario.numcad,
                // empresaSolicitante: taskData.usuario.numemp,
                // tipoColaboradorSolicitante: taskData.usuario.tipcol,
                // usuario: taskData.usuario.solicitante,
                idAnexo: taskData.idAnexo,
                idAnexo2: taskData.idAnexo2,
                // anexo: taskData.anexo.name,
                // anexoBase64: taskData.anexoBase64.base64,
                tarefa1_JSON: JSON.stringify(taskData),
                dados: `Empresa ${taskData.empresa.numemp} - ${taskData.empresa.codfil} - ${taskData.empresa.nomfil} - Colaborador ${taskData.usuario?.numcad} - ${taskData.usuario?.nomfun}`
            }

            if (tarefaAtiva == 1) {
                retorno.nomeSolicitante = taskData.usuario.nomfun;
                retorno.cadastroSolicitante = taskData.usuario.numcad;
                retorno.empresaSolicitante = taskData.usuario.numemp;
                retorno.tipoColaboradorSolicitante = taskData.usuario.tipcol;
                retorno.usuario = taskData.usuario.solicitante;
            }
            const token = (await info.getPlatformData()).token.access_token
            const novaSolicitacao = await info.isRequestNew()
            // console.log('novaSolicitacao', novaSolicitacao)
            if (taskData.anexo?.name) {
                if (!taskData?.anexoBase64?.base64) {
                    alert('Ocorreu um erro ao carregar anexo. Remova-o e tente novamente.')
                    throw new Error('Ocorreu um erro ao carregar anexo. Remova-o e tente novamente.')
                }
                let idAnexo
                if (!novaSolicitacao) {
                    idAnexo = await sendAnexo(token, data.processInstanceId, taskData.anexo)
                } else {
                    idAnexo = await sendAnexo(token, '', taskData.anexo)
                }
                // await linkAttachments(
                //     token,
                //     [idAnexo],
                //     data.processInstanceId
                // )
                retorno.idAnexo = idAnexo
            }
            if (taskData.anexo2?.name) {
                if (!taskData?.anexo2Base64?.base64) {
                    alert('Ocorreu um erro ao carregar anexo. Remova-o e tente novamente.')
                    throw new Error('Ocorreu um erro ao carregar anexo 2. Remova-o e tente novamente.')
                }
                let idAnexo2
                if (!novaSolicitacao) {
                    idAnexo2 = await sendAnexo(token, data.processInstanceId, taskData.anexo2)
                } else {
                    idAnexo2 = await sendAnexo(token, '', taskData.anexo2)
                }
                // if (!novaSolicitacao) {
                //     await linkAttachments(
                //         token,
                //         [idAnexo2],
                //         data.processInstanceId
                //     )
                // }
                retorno.idAnexo2 = idAnexo2
            }
            return {
                formData: { ...retorno }
            }
        } else {
            setMessage({ severity: 'error', summary: 'Formulário Inválido! Verifique todos os campos obrigatórios', life: 10000 });
            GLOBAL.erros = invalidForm;
            saveStop();
        }
    }

    async function tarefa_2() {
        const proximaTarefa = data.nextAction;
        const taskData = GLOBAL.tarefa_2;
        let erroIntegracao = 0;
        let integracao;

        if (findSring(proximaTarefa.name, 'Ajusta') || findSring(proximaTarefa.name, 'Reprova')) {
            let msgReprovado = 'Para reprovar a solicitação, o campo "Descrição SESMT" é obrigatório.'
            let msgAjustar = 'Para solicitar um ajuste, o campo "Descrição SESMT" é obrigatório.'
            // let msgCampos = 'Há Campos obrigatórios não preechidos.'  
            if (!taskData.descricaoSesmt) {
                setMessage({
                    severity: 'error',
                    detail: findSring(proximaTarefa.name, 'Ajusta') ? msgAjustar : msgReprovado,
                    sticky: true,
                    life: 10000
                });
                invalidForm = true;
            }
            // validation();


        } else {

            if (!taskData.situacao?.sesmt && !taskData.novaSituacao?.sesmt && !taskData.ufConselhoProf?.uf) {
                setMessage({
                    severity: 'error',
                    detail: 'Você precisa selecionar uma opção no campo "UF Conselho Prof."',
                    life: 10000
                });
                document.querySelector('.erroUf').classList.add('p-invalid');
                document.querySelector('#erroUfMsg').classList.remove('hidden');
                saveStop();
            }
            if (!taskData.situacao?.sesmt && !taskData.novaSituacao?.sesmt && !taskData.atendente) {
                setMessage({
                    severity: 'error',
                    detail: 'Você precisa prencher o nome do atendente.',
                    life: 10000
                });
                document.querySelector('.erroUf').classList.add('p-invalid');
                document.querySelector('#erroUfMsg').classList.remove('hidden');
                saveStop();
            }
            if (!taskData.situacao?.sesmt && !taskData.novaSituacao?.sesmt && !taskData.orgaoClasse) {
                setMessage({
                    severity: 'error',
                    detail: 'Você precisa prencher o Órgão de classe.',
                    life: 10000
                });
                document.querySelector('.erroUf').classList.add('p-invalid');
                document.querySelector('#erroUfMsg').classList.remove('hidden');
                saveStop();
            }
            if (!taskData.situacao?.sesmt && !taskData.novaSituacao?.sesmt && !taskData.regConselhoProf) {
                setMessage({
                    severity: 'error',
                    detail: 'Você precisa prencher o Conselho Profissional.',
                    life: 10000
                });
                document.querySelector('.erroUf').classList.add('p-invalid');
                document.querySelector('#erroUfMsg').classList.remove('hidden');
                saveStop();
            }


            if (!taskData.requerimento) {
                setMessage({
                    severity: 'error',
                    detail: 'O Anexo Requerimento é obrigatório.',
                    sticky: true,
                    life: 10000
                });
                invalidForm = true;
            }
            if (!taskData.carta) {
                setMessage({
                    severity: 'error',
                    detail: 'O Anexo Carta Orientativa é obrigatório.',
                    sticky: true,
                    life: 10000
                });
                invalidForm = true;
            }
            validation();
        }

        if (!invalidForm) {
            if (findSring(proximaTarefa.name, 'Aprova')) {
                let novoAfastamento;
                let afastamentos = [{
                    numemp: GLOBAL.state.variaveisProcesso.empresaSolicitante,
                    tipcol: GLOBAL.state.variaveisProcesso.tipoColaboradorSolicitante,
                    numcad: GLOBAL.state.variaveisProcesso.cadastroSolicitante,
                    datafa: GLOBAL.tarefa_2.dataInicio?.toLocaleDateString(),
                    ...(GLOBAL.tarefa_2?.horaInicio && { horafa: `${GLOBAL.tarefa_2.horaInicio.getHours()}:${GLOBAL.tarefa_2.horaInicio.getMinutes()}` }),
                    ...(GLOBAL.tarefa_2?.dataTermino && { datter: GLOBAL.tarefa_2.dataTermino?.toLocaleDateString() }),
                    ...(GLOBAL.tarefa_2?.horaTermino && { horter: `${GLOBAL.tarefa_2.horaTermino.getHours()}:${GLOBAL.tarefa_2.horaTermino.getMinutes()}` }),
                    sitafa: GLOBAL.tarefa_2.situacao?.codsit,
                    obsafa: GLOBAL.tarefa_2?.descricao || '',
                    diaprv: GLOBAL.tarefa_2.dataTermino ? GLOBAL.tarefa_2.quantidadeDias : GLOBAL.tarefa_2.prevQuantidadeDias,
                    idbpm: data.processInstanceId,
                    // nomeprocesso: GLOBAL.state.dadosTarefa.processName,
                    ...((GLOBAL.tarefa_2.prevDataTermino || GLOBAL.tarefa_2.dataTermino) && { prvter: GLOBAL.tarefa_2.prevDataTermino?.toLocaleDateString() || GLOBAL.tarefa_2.dataTermino?.toLocaleDateString() }),
                    ...(GLOBAL.tarefa_2.atendente && { nomate: GLOBAL.tarefa_2.atendente }),
                    ...(GLOBAL.tarefa_2.orgaoClasse?.codigo && { orgcla: GLOBAL.tarefa_2.orgaoClasse?.codigo }),
                    ...(GLOBAL.tarefa_2.regConselhoProf && { regcon: GLOBAL.tarefa_2.regConselhoProf }),
                    // codsub: GLOBAL.tarefa_2.cid?.codcid || '',
                    ...(GLOBAL.tarefa_2.cid?.codcid && { codsub: GLOBAL.tarefa_2.cid?.codcid }),
                    ...(taskData?.ufConselhoProf?.uf && { estcon: taskData?.ufConselhoProf?.uf })
                    //datprv
                    //codate
                }];
                if (
                    GLOBAL.tarefa_2.novaSituacao &&
                    // GLOBAL.tarefa_2.novaQuantidadeDias &&
                    GLOBAL.tarefa_2.novaDataInicio
                ) {
                    novoAfastamento = {
                        numemp: GLOBAL.state.variaveisProcesso.empresaSolicitante,
                        tipcol: GLOBAL.state.variaveisProcesso.tipoColaboradorSolicitante,
                        numcad: GLOBAL.state.variaveisProcesso.cadastroSolicitante,
                        datafa: GLOBAL.tarefa_2.novaDataInicio?.toLocaleDateString(),
                        // datter: GLOBAL.tarefa_2.novaDataTermino?.toLocaleDateString(),
                        ...(GLOBAL.tarefa_2?.dataTermino && { datter: GLOBAL.tarefa_2.dataTermino?.toLocaleDateString() }),
                        sitafa: GLOBAL.tarefa_2.novaSituacao?.codsit,
                        obsafa: GLOBAL.tarefa_2?.descricao || '',
                        diaprv: GLOBAL.tarefa_2.novaDataTermino ? GLOBAL.tarefa_2.novaQuantidadeDias : GLOBAL.tarefa_2.novaPrevQuantidadeDias,
                        idbpm: data.processInstanceId,
                        // nomeprocesso: GLOBAL.state.dadosTarefa.processName,
                        // prvter: GLOBAL.tarefa_2.novaPrevDataTermino?.toLocaleDateString() || GLOBAL.tarefa_2.novaDataTermino?.toLocaleDateString(),
                        ...((GLOBAL.tarefa_2.prevDataTermino || GLOBAL.tarefa_2.dataTermino) && { prvter: GLOBAL.tarefa_2.prevDataTermino?.toLocaleDateString() || GLOBAL.tarefa_2.dataTermino?.toLocaleDateString() }),
                        // nomate: GLOBAL.tarefa_2.atendente,
                        // orgcla: GLOBAL.tarefa_2.orgaoClasse?.codigo,
                        // regcon: GLOBAL.tarefa_2.regConselhoProf,
                        // codsub: GLOBAL.tarefa_2.cid?.codcid || '',
                        // estcon: taskData?.ufConselhoProf?.uf,
                        ...(GLOBAL.tarefa_2.atendente && { nomate: GLOBAL.tarefa_2.atendente }),
                        ...(GLOBAL.tarefa_2.orgaoClasse?.codigo && { orgcla: GLOBAL.tarefa_2.orgaoClasse?.codigo }),
                        ...(GLOBAL.tarefa_2.regConselhoProf && { regcon: GLOBAL.tarefa_2.regConselhoProf }),
                        ...(GLOBAL.tarefa_2.cid?.codcid && { codsub: GLOBAL.tarefa_2.cid?.codcid }),
                        ...(taskData?.ufConselhoProf?.uf && { estcon: taskData?.ufConselhoProf?.uf })
                        //datprv
                        //codate
                    }
                }
                novoAfastamento ? afastamentos.push(novoAfastamento) : null;

                console.log(afastamentos)
                console.log(GLOBAL.state.variaveisProcesso.cadastroSolicitante)
                let { retorno } = await postAfastamentos(GLOBAL.state.dadosPlataforma.token.access_token, afastamentos);
                if (retorno != 'Sucesso') {
                    // ignorar mensagem de erro específica abaixo
                    if (retorno?.errorMessage?.includes('[Código do Atendente, Nome Atendente, Orgão de Classe, Reg. Conselho Profissional, UF Conselho Profissional, CID-10, CID-11] estarão disponíveis quando o tipo da situação preenchida for [Férias, Serviço Militar, Aviso Prévio Trabalhado')) {
                        integracao = 'Integrado com sucesso'
                        erroIntegracao == 0;
                        setMessage({ severity: 'success', summary: 'Gravado com Sucesso!', detail: 'Afastamento gravado com sucesso!', sticky: true })
                        return
                    }

                    erroIntegracao = 1;
                    setMessage({ severity: 'error', detail: retorno?.errorMessage || retorno, sticky: true, life: 10000 });
                    integracao = 'Erro na integração'
                    throw new Error('Erro na integração.');
                } else if (retorno == 'Sucesso') {
                    integracao = 'Integrado com sucesso'
                    erroIntegracao == 0;
                    setMessage({ severity: 'success', summary: 'Gravado com Sucesso!', detail: 'Afastamento gravado com sucesso!', sticky: true })
                }
            }
            let retorno = {
                dataInicioAfastamento: taskData.dataInicio,
                horaInicio: taskData?.horaInicio,
                dataTerminoAfastamento: taskData.dataTermino,
                horaTermino: taskData?.horaTermino,
                prevTermino: taskData.prevDataTermino,
                prevQuantidadeDias: taskData.prevQuantidadeDias,
                quantidadeDiasAfastamento: taskData.quantidadeDias,
                descricaoSituacao: taskData.situacao.dessit,
                codigoSituacao: taskData.situacao.codsit,
                descricaoSituacaoNovSit: taskData.novaSituacao?.dessit,
                codigoSituacaoNovSit: taskData.novaSituacao?.codsit,
                dataInicioNovSit: taskData.novaDataInicio,
                quantidadeDiasNovSit: taskData?.novaQuantidadeDias || 0,
                dataTerminoNovSit: taskData.novaDataTermino,
                prevTerminoNovSit: taskData.novaPrevDataTermino,
                atendente: taskData.atendente,
                codOrgaoClasse: taskData?.orgaoClasse?.codigo,
                desOrgaoClasse: taskData?.orgaoClasse?.descricao,
                regConselhoProf: taskData?.regConselhoProf,
                ufConselhoProf: taskData?.ufConselhoProf?.uf,
                codCID: taskData.cid?.codcid,
                desCID: taskData.cid?.descid,
                // tarefa2_JSON: JSON.stringify(taskData),
                erroIntegracao,
                consulta60Dias_JSON: JSON.stringify(GLOBAL.consulta60Dias),
                descricaoSesmt: taskData.descricaoSesmt,
                integracao,
                decisao: findSring(proximaTarefa.name, 'Aprova') ? 'Aprovado' : findSring(proximaTarefa.name, 'Reprova') ? 'Reprovado' : 'Ajuste'
            }

            // taskData.carta?.name && await sendAnexo(taskData.carta)
            retorno.tarefa2_JSON = JSON.stringify({ ...taskData })

            const token = (await info.getPlatformData()).token.access_token
            console.log(taskData?.anexosSESMT);
            if (taskData?.anexosSESMT?.length > 0) {
                await Promise.all(
                    taskData.anexosSESMT.map(file => sendAnexo(token, data.processInstanceId, file))
                )
            }
            // throw new Error('pausa')
            return {
                formData: { ...retorno }
            }

        } else {
            saveStop()
        }
    }

    // function tarefa_3() {
    //     tarefa_1();
    // }

    // async function tarefa_4() {
    //     return await tarefa_2();
    // }

    return {
        tarefa_1,
        tarefa_2,
        // tarefa_3,
        // tarefa_4,
    }
}