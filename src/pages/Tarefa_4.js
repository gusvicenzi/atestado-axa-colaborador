import { Column } from "primereact/column";
import { AutoComplete } from "primereact/autocomplete";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Dropdown } from "primereact/dropdown";
import { InputNumber } from "primereact/inputnumber";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { useEffect, useState } from "react";
import { Datepicker } from "../components/Datepicker";
import FieldName from "../components/FieldName";
import useGlobalState, { setMessage } from "../globalState";
import ContentDivisor from "../components/ContentDivisor";
import getListaSituacoes from "../services/getListaSituacoes";
import { addDays, eachDayOfInterval, subDays } from "date-fns";
import obterListaOrgaoDeClasse from "../functions/obterListaOrgaoDeClasse";
import GLOBAL from '../integration/storage.json'
import getCID from "../services/getCID";
import exibirAnexo from "../functions/exibirAnexo";
import { downloadAttachment } from "../services/anexo/downloadAttachment";
import { useRef } from "react";
import { FileUpload } from "primereact/fileupload";
import { newAttachment } from "../services/anexo/newAttachment";
import { uploadFile } from "../services/anexo/uploadFile";
import { commitAttachment } from "../services/anexo/commitAttachment";
import { linkAttachments } from "../services/anexo/linkAttachments";
import { sendAnexo } from "../functions/sendAnexo";
import { inserirAnexos } from "../functions/inserirAnexos";

export default function Tarefa_4() {
    const { globalState } = useGlobalState();
    let initialState = globalState.variaveisProcesso?.tarefa2_JSON;
    if (initialState) {
        initialState.dataInicio = new Date(initialState.dataInicio);
        initialState.dataTermino = new Date(initialState.dataTermino);
        initialState.novaDataInicio = new Date(initialState.novaDataInicio);
        initialState.novaDataTermino = new Date(initialState.novaDataTermino);
    }
    const [state, setState] = useState(initialState);
    const [tableData, setTableData] = useState(globalState.variaveisProcesso?.consulta60Dias_JSON || []);
    const [listaAfastamentos, setListaAfastamentos] = useState([]);
    const [ufOptions, setUfOptions] = useState([]);
    const [datult, setDatult] = useState(null);

    const anexoExtraRef = useRef(null)

    useEffect(() => {
        getListaSituacoes(globalState.dadosPlataforma.token.access_token).then(data => {
            data.map(d => d.label = `${d.codsit} - ${d.dessit}`)
            setListaAfastamentos(data);
            if (data.datult) {
                setDatult(data.datult)
            } else {
                setDatult("Sem informação")
            }
            let situacaoSolicitada = data.filter(({ codsit }) => codsit == globalState.variaveisProcesso?.codigoSituacao)[0];
            setState({ ...state, situacao: situacaoSolicitada });
        });
    }, [])

    // useEffect(() => {
    //     GLOBAL.tarefa_2 = state;
    //     GLOBAL.state = globalState;
    // }, [state])

    // useEffect(() => {
    //     console.log(globalState)
    // }, [state])

    function obterTotais() {
        let totais = {
            licencaMedica: 0,
            auxDoenca: 0,
            quantidadeDiasSolitado: eachDayOfInterval({ start: new Date(globalState.variaveisProcesso.tarefa1_JSON.dataInicio), end: new Date(globalState.variaveisProcesso.tarefa1_JSON.dataTermino) }).length,
            sugestaoDiasAuxDoenca: 0,
            diasAtestadosDisponiveis: 0
        };
        if (tableData.length) {
            tableData.map(d => {
                if (d.sitafa == 14 || d.sitafa == 23) {
                    totais.licencaMedica += d.diaprv;
                } else if (d.sitafa == 3 || d.sitafa == 4) {
                    totais.auxDoenca += d.diaprv;
                }
            })
        }
        totais.diasAtestadosDisponiveis = totais.licencaMedica >= 15 ? 0 : 15 - totais.licencaMedica;
        totais.sugestaoDiasAuxDoenca = totais.quantidadeDiasSolitado <= totais.diasAtestadosDisponiveis ? 0 : totais.quantidadeDiasSolitado - totais.diasAtestadosDisponiveis;
        let tabelaTotais = [
            { key: 'Total Dias Licença Médica Últimos 60 Dias', value: totais.licencaMedica },
            { key: 'Total Dias Auxílio Doença', value: totais.auxDoenca },
            { key: 'Total Atestado Solicitação', value: totais.quantidadeDiasSolitado },
            { key: 'Dias Lic. Médica a Pagar até 15 Dias', value: totais.diasAtestadosDisponiveis },
            { key: 'Total Dias INSS/Faltas', value: totais.sugestaoDiasAuxDoenca }
        ]

        function obterSugestaoData() {
            let sugestao = '';
            if (totais.diasAtestadosDisponiveis < totais.quantidadeDiasSolitado) {
                let sugestaoInicio = addDays(globalState.variaveisProcesso.dataInicioAfastamento, totais.diasAtestadosDisponiveis);
                let sugestaoTermino = addDays(sugestaoInicio, totais.sugestaoDiasAuxDoenca - 1)
                sugestao = `${sugestaoInicio.toLocaleDateString()} - ${sugestaoTermino.toLocaleDateString()}`
            }
            return sugestao;
        }
        return (
            <div className="grid">
                {
                    tabelaTotais.map(({ key, value }) => (
                        <>
                            <div className="col-8 lg:col-4 text-sm font-normal py-1 border-bottom-1 border-500 ">
                                {key}
                            </div>
                            <div className="col-4 lg:col-2 text-sm py-1 border-bottom-1 text-center border-500">
                                {value}
                            </div>
                            <div className="lg:col-6 py-1"></div>
                        </>
                    ))
                }
                <div className="col-8 lg:col-4 text-sm font-normal py-1  border-500 ">
                    Sugestão Requerimento Aux. Doença
                </div>
                <div className="col-4 lg:col-2 text-sm py-1 text-center border-500">
                    {obterSugestaoData()}
                </div>
            </div>
        )
    }

    async function inserirAnexoExtra(event) {
        anexoExtraRef.current.clear();
        const file = event.files[0];
        const kb = parseInt(file.size / 1000);
        console.log('Tamanho do arquivo => ', `${kb} kb`);

        if (kb <= 5010) {
            // try {
            //     const token = globalState.dadosPlataforma.token.access_token
            //     console.log(globalState.data.processInstanceId)
            //     const uploadInfo = await newAttachment(token, file.name, file.size)
            //     console.log(file.name, uploadInfo)
            //     await uploadFile(uploadInfo, file)
            //     await commitAttachment(
            //         token,
            //         uploadInfo.attachment.id
            //     )
            //     await linkAttachments(
            //         token,
            //         [uploadInfo.attachment.id],
            //         globalState.data.processInstanceId
            //     )
            //     alert('Anexo enviado com sucesso')
            // } catch (e) {
            //     alert('Erro ao enviar anexo')
            // }
            await sendAnexo(globalState.dadosPlataforma.token.access_token,
                globalState.data.processInstanceId, file)
        } else {
            alert('O Arquivo Selecionado Excedeu o Limite de 5mb');
        }
    }

    return (
        <form>
            <div className="grid">
                <ContentDivisor icon='pi pi-user' content='Solicitante' />

                <div className='col-12 lg:col-6 field'>
                    <FieldName
                        name='Empresa'
                    />
                    <InputText
                        disabled
                        className='w-full'
                        value={`${globalState.variaveisProcesso?.tarefa1_JSON.empresa?.numemp} - ${globalState.variaveisProcesso?.tarefa1_JSON.empresa?.codfil} - ${globalState.variaveisProcesso?.tarefa1_JSON.empresa?.nomfil}`}
                    />
                </div>
                <div className='lg:col-6'></div>
                <div className="col-12 lg:col-6 field">
                    <FieldName required name='Colaborador' />
                    <InputText
                        className='w-full obrigatorio'
                        value={`${globalState.variaveisProcesso?.tarefa1_JSON.usuario?.numcad} - ${globalState.variaveisProcesso?.tarefa1_JSON.usuario?.nomfun}`}
                        disabled
                    />
                </div>
                <div className="lg:col-6"></div>
                <ContentDivisor icon='pi pi-file' content={`Anexo Atestado / Afastamento`} />
                {
                    (globalState.data?.processInstanceId <= 800 || globalState.data?.processInstanceId >= 1700) && <div className="col-12 grid m-0">
                        {(globalState.variaveisProcesso?.tarefa1_JSON?.anexoBase64 &&
                            <div className="col-12 lg:col-6 field">
                                <Button
                                    className="w-full"
                                    onClick={() => exibirAnexo(globalState.variaveisProcesso?.tarefa1_JSON?.anexoBase64.base64)}
                                    label={`Exibir Anexo: ${globalState.variaveisProcesso?.tarefa1_JSON?.anexoBase64.nome}`}
                                    type="button"
                                />
                            </div>
                        )}
                        {
                            (globalState.variaveisProcesso?.tarefa1_JSON?.anexo2Base64 && <div className="col-12 lg:col-6 field"><Button
                                className="w-full"
                                onClick={() => exibirAnexo(globalState.variaveisProcesso?.tarefa1_JSON?.anexo2Base64.base64)}
                                label={`Exibir Anexo: ${globalState.variaveisProcesso?.tarefa1_JSON?.anexo2Base64.nome}`}
                                type="button"
                            /></div>)
                        }

                    </div>


                }
                <div className="col-12">
                    <DataTable
                        hidden={!tableData?.length}
                        size="small"
                        emptyMessage='Nenhum resultado encontrado'
                        scrollable
                        scrollHeight={'15rem'}
                        responsiveLayout="scroll"
                        header='Afastamento Últimos 60 Dias'
                        footer={globalState.variaveisProcesso?.tarefa1_JSON?.dataTermino ? obterTotais : 'Afastamento Prazo Indeterminado'}
                        value={tableData}
                    >
                        <Column
                            header='Situação'
                            field="sitafa"
                            align={'center'}
                        />
                        <Column
                            header='Afastamento'
                            field="dessit"
                        />
                        <Column
                            header='Início'
                            field="datafa"
                        />
                        <Column
                            header='Término'
                            field="datter"
                        />
                        <Column
                            header='Qntd. Dias'
                            field="diaprv"
                            align='center'
                        />
                        <Column
                            header='CID'
                            field="codsub"
                        />
                        <Column
                            hidden={!tableData?.filter(({ desdoe }) => desdoe).length}
                            header='Descrição CID'
                            field='desdoe'
                            style={{ minWidth: '40%' }}
                            body={({ desdoe }) => (
                                <textarea
                                    style={{ border: 'none', width: '100%', background: 'none', resize: 'none', color: '#212529' }}
                                    disabled
                                    rows={2}
                                >{desdoe}
                                </textarea>
                            )}
                        />
                    </DataTable>
                </div>
                <ContentDivisor icon='pi pi-tag' content={`Afastamento Solicitado`} />
                <div className="col-12 lg:col-4 field">
                    <FieldName name='Situação' />
                    <Dropdown
                        className="w-full"
                        disabled
                        options={listaAfastamentos}
                        value={state?.situacao}
                        optionLabel='label'
                    />
                </div>
                <div className="col-12 lg:col-offset-4 lg:col-2 field">
                    <FieldName name='Início' />
                    <Datepicker
                        disabled
                        showOnFocus={false}
                        value={globalState.variaveisProcesso?.dataInicioAfastamento}
                        className="w-full"
                    />
                </div>

                <div className="col-12 lg:col-2 field">
                    <FieldName name='Ultima data trabalhada' />
                    <InputText
                        readOnly
                        className="w-full"
                        value={datult}
                    />
                </div>

                <div className="col-6 lg:col-2 field">
                    <FieldName name='Qntd. Dias Término' />
                    <InputNumber
                        disabled
                        className="w-full"
                        inputClassName="w-full"
                        value={state?.quantidadeDias || globalState.variaveisProcesso?.quantidadeDiasAfastamento}
                    />
                </div>
                <div className="col-6 lg:col-3 field">
                    <FieldName name='Término' />
                    <Datepicker
                        disabled
                        value={state?.dataTermino || globalState.variaveisProcesso?.dataTerminoAfastamento}
                        showOnFocus={false}
                        className='w-full'
                        onChange={({ value }) => setState({ ...state, dataTermino: value })}
                    />
                </div>
                <div className="lg:col-6"></div>
                <div className="grid px-2" style={{ display: state?.novaSituacao ? '' : 'none' }}>
                    <ContentDivisor icon='pi pi-tag' content={`Novo Afastamento`} />
                    <div className="col-12 lg:col-4 field">
                        <FieldName name='Situação' />
                        <Dropdown
                            disabled
                            className="w-full"
                            options={listaAfastamentos}
                            value={state?.novaSituacao}
                            optionLabel='label'
                        />
                    </div>
                    <div className="col-12 lg:col-offset-2 lg:col-3 field">
                        <FieldName name='Início' />
                        <Datepicker
                            disabled
                            showOnFocus={false}
                            value={state?.novaDataInicio}
                            className="w-full"
                        />
                    </div>
                    <div className="col-6 lg:col-2 field">
                        <FieldName name='Qntd. Dias Término' />
                        <InputNumber
                            disabled
                            className="w-full"
                            inputClassName="w-full"
                            value={state?.novaQuantidadeDias}
                        />
                    </div>
                    <div className="col-6 lg:col-3 field">
                        <FieldName name='Término' />
                        <Datepicker
                            disabled
                            showOnFocus={false}
                            className='w-full'
                            value={state?.novaDataTermino}
                        />
                    </div>
                    <div className="lg:col-6"></div>
                </div>
                <div className="col-12 field">
                    <FieldName name='Descrição' required />
                    <InputTextarea
                        className="w-full"
                        rows={4}
                        disabled
                        value={globalState.variaveisProcesso?.descricaoAfastamento}
                    />
                </div>
                <ContentDivisor icon={"fa-solid fa-briefcase-medical"} content='SESMT' />
                <div className="col-12 lg:col-6 field">
                    <FieldName name='Atendente' required />
                    <InputText
                        disabled
                        className="w-full obrigatorio"
                        value={state?.atendente}
                    />
                </div>
                <div className="col-12 lg:col-6 field">
                    <FieldName name='Órgao de Classe' required />
                    <Dropdown
                        disabled
                        className="w-full"
                        value={state?.orgaoClasse}
                        options={obterListaOrgaoDeClasse()}
                        optionLabel='descricao'
                    />
                </div>
                <div className="col-12 lg:col-2 field">
                    <FieldName name='Reg. Conselho Prof.' required />
                    <InputNumber
                        disabled
                        className="w-full obrigatorio"
                        inputClassName="w-full"
                        value={state?.regConselhoProf}
                        onChange={({ value }) => setState({ ...state, regConselhoProf: value })}
                    />
                </div>
                <div className="col-12 lg:col-offset-4 lg:col-6 field">
                    <FieldName name='UF Conselho Prof.' required />
                    <AutoComplete
                        disabled
                        value={state?.ufConselhoProf}
                        suggestions={ufOptions}
                        field='nome'
                        inputClassName='w-full'
                        className="w-full obrigatorio"
                    />
                </div>
                <div className="col-12 field">
                    <FieldName name='CID' />
                    <div className="flex flex-row align-items-center w-full">
                        <InputText
                            disabled
                            value={state?.cid?.codcid || ''}
                            className='w-5rem mr-2'
                        />
                        <span className="text-700 text-sm">
                            {
                                state?.cid?.codcid ? state.cid?.descid : ''
                            }
                        </span>
                    </div>
                </div>
                {/* <div className="col-12 field">
                    {
                        (!globalState.novaSolicitacao && globalState.variaveisProcesso?.tarefa2_JSON?.requerimentoId) &&
                        <div className="col-12 lg:col-4">
                            <Button
                                className="w-full"
                                // onClick={() => exibirAnexo(globalState.variaveisProcesso?.tarefa2_JSON?.requerimentoBase64?.base64)}
                                onClick={async () => {
                                    const token = globalState.dadosPlataforma.token.access_token
                                    const url = await downloadAttachment(token, globalState.variaveisProcesso?.tarefa2_JSON?.requerimentoId)
                                    window.open(url)
                                }}
                                label="Download do Requerimento"
                                type="button"
                            />
                        </div>
                    }

                    {
                        (!globalState.novaSolicitacao && globalState.variaveisProcesso?.tarefa2_JSON?.cartaId) &&
                        <div className="col-12 lg:col-4">
                            <Button
                                className="w-full"
                                // onClick={() => exibirAnexo(globalState.variaveisProcesso?.tarefa2_JSON?.cartaBase64?.base64)}
                                onClick={async () => {
                                    const token = globalState.dadosPlataforma.token.access_token
                                    const url = await downloadAttachment(token, globalState.variaveisProcesso?.tarefa2_JSON?.cartaId)
                                    window.open(url)
                                }}
                                label="Download da Carta"
                                type="button"
                            />
                        </div>

                    }
                </div> */}
                <div className="col-12 field">
                    <FieldName name='Anexo Extra' />
                    <FileUpload
                        ref={anexoExtraRef}
                        name='Anexo Carta'
                        mode='basic'
                        accept='image/*, .pdf'
                        auto
                        multiple
                        customUpload
                        uploadHandler={(e) => inserirAnexos(e, globalState, anexoExtraRef)}
                        chooseOptions={{ icon: 'pi pi-file', label: 'Adicionar Anexos Extra', className: 'p-button-outlined w-full' }}
                    />
                </div>
                <div className="col-12 field">
                    <FieldName name='Descrição SESMT' />
                    <InputTextarea
                        rows={4}
                        disabled
                        className='w-full'
                        value={state?.descricaoSesmt}
                    />
                </div>
            </div>
        </form >
    )
}

const Style = {
    label: 'text-700'
}