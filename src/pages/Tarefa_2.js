import { Column } from "primereact/column";
import { AutoComplete } from "primereact/autocomplete";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Dropdown } from "primereact/dropdown";
import { InputNumber } from "primereact/inputnumber";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { useEffect, useRef, useState } from "react";
import { Datepicker } from "../components/Datepicker";
import FieldName from "../components/FieldName";
import useGlobalState, { setMessage } from "../globalState";
import getAfastamentos60Dias from "../services/getAfastamentos60Dias";
import ContentDivisor from "../components/ContentDivisor";
import getListaSituacoes from "../services/getListaSituacoes";
import { addDays, eachDayOfInterval } from "date-fns";
import obterListaOrgaoDeClasse from "../functions/obterListaOrgaoDeClasse";
import GLOBAL from '../integration/storage.json'
import getCID from "../services/getCID";
import exibirAnexo from "../functions/exibirAnexo";
import { FileUpload } from "primereact/fileupload";
import { sendAnexo } from "../functions/sendAnexo";
import { Calendar } from "primereact/calendar";

export default function Tarefa_2() {
    const { globalState } = useGlobalState();
    let initialState = {
        ufConselhoProf: null,
        cid: {
            codcid: '',
            descid: ''
        },
        atendente: '',
        orgaoClasse: null,
        regConselhoProf: null,
        situacao: globalState.variaveisProcesso.tarefa1_JSON.situacao,
        dataInicio: globalState.variaveisProcesso.dataInicioAfastamento,
        horaInicio: globalState.variaveisProcesso.horaInicio,
        quantidadeDias: globalState.variaveisProcesso.quantidadeDiasAfastamento,
        dataTermino: globalState.variaveisProcesso.dataTerminoAfastamento,
        horaTermino: globalState.variaveisProcesso.horaTermino,
        prevDataTermino: null,
        prevQuantidadeDias: null,
        descricao: globalState.variaveisProcesso.descricaoAfastamento,
        novaSituacao: null,
        novaDataInicio: globalState.variaveisProcesso.dataTerminoAfastamento ? addDays(globalState.variaveisProcesso.dataTerminoAfastamento, 1) : null,
        novaDataTermino: null,
        novaQuantidadeDias: null,
        novaPrevDataTermino: null,
        novaPrevQuantidadeDias: null,
        descricaoSesmt: globalState.variaveisProcesso?.descricaoSesmt || " ",
        anexo: {
            nome: globalState.variaveisProcesso.anexo,
            base64: globalState.variaveisProcesso.anexoBase64
        },
        requerimento: {
            nome: null,
            base64: null
        },
        carta: {
            nome: null,
            base64: null
        },
        anexosSESMT: []
    }

    const [loading, setLoading] = useState({ table: true })
    const [loadingCID, setLoadingCID] = useState(false)
    const [state, setState] = useState(initialState);
    const [tableData, setTableData] = useState([]);
    const [todosAfastamentos, setTodosAfastamentos] = useState([]);
    const [listaSituacoes, setListaSituacoes] = useState([]);
    const [ufOptions, setUfOptions] = useState([]);
    const [novoAfastamentoVisible, setNovoAfastamentoVisible] = useState(false);
    const anexoRequerimentoRef = useRef(null);
    const anexoCartaRef = useRef(null);

    const [datult, setDatult] = useState(null);

    useEffect(() => {
        getAfastamentos60Dias(globalState.dadosPlataforma.token.access_token,
            globalState.variaveisProcesso.tarefa1_JSON?.usuario,
            new Date(globalState.variaveisProcesso.dataInicioAfastamento).toLocaleDateString()
        ).then(data => {
            setTableData(data.lista)
            if (data.datult) {
                setDatult(data.datult)
            } else {
                setDatult("Sem informação")
            }
        }).finally(() => setLoading({ ...loading, table: false }));
        getAfastamentos60Dias(globalState.dadosPlataforma.token.access_token,
            globalState.variaveisProcesso.tarefa1_JSON?.usuario).then(data => setTodosAfastamentos(data.lista));
        getListaSituacoes(globalState.dadosPlataforma.token.access_token).then(data => {
            data.map(d => d.label = `${d.codsit} - ${d.dessit}`)
            setListaSituacoes(data);
            let situacaoSolicitada = data.filter(({ codsit }) => codsit == globalState.variaveisProcesso.codigoSituacao)[0];
            setState({ ...state, situacao: situacaoSolicitada });
        });
    }, [])
    useEffect(() => {
        GLOBAL.consulta60Dias = tableData;
        GLOBAL.tarefa_2 = state;
        GLOBAL.state = globalState;
    }, [state])

    // Controle da atualização de datas e quantidades de dias
    useEffect(() => {
        if (state.quantidadeDias && state.dataInicio) {
            let dataTermino = addDays(state.dataInicio, state.quantidadeDias - 1);
            setState({ ...state, dataTermino })
        }
    }, [state.quantidadeDias]);
    useEffect(() => {
        if (state.dataTermino && state.dataInicio) {
            let quantidadeDias = eachDayOfInterval({ start: state.dataInicio, end: state.dataTermino }).length;
            setState({ ...state, quantidadeDias, novaDataInicio: addDays(state.dataTermino, 1) });
        } else {
            setState({ ...state, novaDataInicio: null })
        }

    }, [state.dataTermino]);
    useEffect(() => {
        if (state.prevQuantidadeDias && state.dataInicio) {
            let prevDataTermino = addDays(state.dataInicio, state.prevQuantidadeDias - 1);
            setState({ ...state, prevDataTermino })
        }
    }, [state.prevQuantidadeDias]);
    useEffect(() => {
        if (state.prevDataTermino && state.dataInicio) {
            let prevQuantidadeDias = eachDayOfInterval({ start: state.dataInicio, end: state.prevDataTermino }).length;
            setState({ ...state, prevQuantidadeDias });
        }
    }, [state.prevDataTermino]);
    useEffect(() => {
        if (state.novaQuantidadeDias && state.novaDataInicio) {
            let novaDataTermino = addDays(state.novaDataInicio, state.novaQuantidadeDias - 1);
            setState({ ...state, novaDataTermino });
        }
    }, [state.novaQuantidadeDias]);
    useEffect(() => {
        if (state.novaDataTermino && state.novaDataInicio) {
            let novaQuantidadeDias = eachDayOfInterval({ start: state.novaDataInicio, end: state.novaDataTermino }).length;
            setState({ ...state, novaQuantidadeDias });
        }
    }, [state.novaDataTermino]);
    useEffect(() => {
        if (state.novaPrevQuantidadeDias && state.novaDataInicio) {
            let novaPrevDataTermino = addDays(state.novaDataInicio, state.novaPrevQuantidadeDias - 1);
            setState({ ...state, novaPrevDataTermino })
        }
    }, [state.novaPrevQuantidadeDias]);
    useEffect(() => {
        if (state.novaPrevDataTermino && state.novaDataInicio) {
            let novaPrevQuantidadeDias = eachDayOfInterval({ start: state.novaDataInicio, end: state.novaPrevDataTermino }).length;
            setState({ ...state, novaPrevQuantidadeDias });
        }
    }, [state.novaPrevDataTermino]);
    useEffect(() => {
        if (state.novaDataInicio && state.novaSituacao && state.novaQuantidadeDias) {
            let novaDataTermino = addDays(state.novaDataInicio, state.novaQuantidadeDias - 1);
            setState({ ...state, novaDataTermino });
        }
    }, [state.novaDataInicio])
    //

    function novoAfastamento() {
        setState({
            ...state,
            novaDataTermino: null,
            novaSituacao: null,
            novaQuantidadeDias: null,
            novaPrevDataTermino: null,
            novaPrevQuantidadeDias: null
        })
        setNovoAfastamentoVisible(!novoAfastamentoVisible ? true : false);
    }

    function obterTotais() {
        let totais = {
            licencaMedica: 0,
            auxDoenca: 0,
            quantidadeDiasSolitado: eachDayOfInterval({ start: state.dataInicio ? state.dataInicio : new Date(globalState.variaveisProcesso.tarefa1_JSON.dataInicio), end: state.dataTermino ? state.dataTermino : new Date(globalState.variaveisProcesso.tarefa1_JSON.dataTermino) }).length,
            sugestaoDiasAuxDoenca: 0,
            diasAtestadosDisponiveis: 0
        };
        tableData.map(d => {
            if (d.sitafa == 14 || d.sitafa == 23) {
                totais.licencaMedica += d.diaprv;
            } else if (d.sitafa == 3 || d.sitafa == 4) {
                totais.auxDoenca += d.diaprv;
            }
        })
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

    function buscarEstadoUF(ev) {
        const estados = [
            { uf: 'AC', nome: 'Acre' },
            { uf: 'AL', nome: 'Alagoas' },
            { uf: 'AP', nome: 'Amapá' },
            { uf: 'AM', nome: 'Amazonas' },
            { uf: 'BA', nome: 'Bahia' },
            { uf: 'CE', nome: 'Ceará' },
            { uf: 'DF', nome: 'Distrito Federal' },
            { uf: 'ES', nome: 'Espirito Santo' },
            { uf: 'GO', nome: 'Goiás' },
            { uf: 'MA', nome: 'Maranhão' },
            { uf: 'MS', nome: 'Mato Grosso do Sul' },
            { uf: 'MT', nome: 'Mato Grosso' },
            { uf: 'MG', nome: 'Minas Gerais' },
            { uf: 'PA', nome: 'Pará' },
            { uf: 'PB', nome: 'Paraíba' },
            { uf: 'PR', nome: 'Paraná' },
            { uf: 'PE', nome: 'Pernambuco' },
            { uf: 'PI', nome: 'Piauí' },
            { uf: 'RJ', nome: 'Rio de Janeiro' },
            { uf: 'RN', nome: 'Rio Grande do Norte' },
            { uf: 'RS', nome: 'Rio Grande do Sul' },
            { uf: 'RO', nome: 'Rondônia' },
            { uf: 'RR', nome: 'Roraima' },
            { uf: 'SC', nome: 'Santa Catarina' },
            { uf: 'SP', nome: 'São Paulo' },
            { uf: 'SE', nome: 'Sergipe' },
            { uf: 'TO', nome: 'Tocantins' }
        ]

        let estadosFiltrados;
        if (!ev.query.trim().length) {
            estadosFiltrados = [...estados];
        } else {
            estadosFiltrados = estados.filter(est => {
                return est.nome.toLocaleLowerCase().startsWith(ev.query.toLocaleLowerCase());
            })
        }
        setUfOptions(estadosFiltrados);
    }


    async function buscarCid() {
        setLoadingCID(true)
        try {
            let retorno = await getCID(globalState.dadosPlataforma.token.access_token, state.cid.codcid);
            if (retorno && retorno.descid) {
                setState({ ...state, cid: retorno });
            } else {
                setMessage({ severity: 'error', detail: retorno.retornomensagem })
            }
        } catch (e) {
            console.log('erro ao consultar CID', e)
        }
        setLoadingCID(false)
    }

    useEffect(() => {
        // console.log('state', state)
        // console.log('globalstate', globalState)
    }, [state])

    async function inserirAnexoRequerimento(event) {
        anexoRequerimentoRef.current.clear();
        const file = event.files[0];
        const kb = parseInt(file.size / 1000);
        console.log('Tamanho do arquivo => ', `${kb} kb`);

        if (kb <= 5010) {
            // let requerimentoBase64 = { nome: file.name };
            // const reader = new FileReader();
            // reader.readAsDataURL(file);
            // reader.onloadend = function () {
            //     requerimentoBase64.base64 = reader.result;
            //     setState(prev => { return { ...prev, requerimentoBase64, requerimento: file } });
            // }
            const requerimentoId = await sendAnexo(globalState.dadosPlataforma.token.access_token,
                globalState.data.processInstanceId, file)
            setState(prev => { return { ...prev, requerimentoId } });
        } else {
            alert('O Arquivo Selecionado Excedeu o Limite de 5mb');
        }
    }

    async function inserirAnexoCarta(event) {
        anexoCartaRef.current.clear();
        const file = event.files[0];
        const kb = parseInt(file.size / 1000);
        console.log('Tamanho do arquivo => ', `${kb} kb`);

        if (kb <= 5010) {
            // let cartaBase64 = { nome: file.name };
            // const reader = new FileReader();
            // reader.readAsDataURL(file);
            // reader.onloadend = function () {
            //     cartaBase64.base64 = reader.result;
            //     setState(prev => { return { ...prev, cartaBase64, carta: file } });
            // } 
            const cartaId = await sendAnexo(globalState.dadosPlataforma.token.access_token,
                globalState.data.processInstanceId, file)
            setState(prev => { return { ...prev, cartaId } });
        } else {
            alert('O Arquivo Selecionado Excedeu o Limite de 5mb');
        }
    }

    useEffect(() => {
        console.log(state.anexosSESMT)
    }, [state.anexosSESMT])

    return (
        <form>
            <div className="grid">
                <ContentDivisor icon='pi pi-user' content='Solicitante' />
                <div className='col-12 lg:col-6 field'>
                    <FieldName
                        name='Empresa'
                    />
                    <InputText
                        readOnly
                        className='w-full'
                        value={`${globalState.variaveisProcesso.tarefa1_JSON.empresa?.numemp} - ${globalState.variaveisProcesso.tarefa1_JSON.empresa?.codfil} - ${globalState.variaveisProcesso.tarefa1_JSON.empresa?.nomfil}`}
                    />
                </div>
                <div className='lg:col-6'></div>
                <div className="col-12 lg:col-6 field">
                    <FieldName required name='Colaborador' />
                    <span className='p-input-icon-right w-full'>
                        <InputText
                            className='w-full obrigatorio'
                            value={`${globalState.variaveisProcesso.tarefa1_JSON.usuario?.numcad} - ${globalState.variaveisProcesso.tarefa1_JSON.usuario?.nomfun}`}
                            readOnly
                        />
                    </span>
                </div>
                <div className='lg:col-6'></div>
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
                        loading={loading.table}
                        hidden={state.situacao.codsit == 6}
                        emptyMessage='Nenhum resultado encontrado'
                        size="small"
                        scrollable
                        scrollHeight={'15rem'}
                        responsiveLayout="scroll"
                        header='Afastamentos Últimos 60 Dias'
                        footer={(state.dataTermino >= state.dataInicio) || (globalState.variaveisProcesso.dataTerminoAfastamento >= state.dataInicio) ? obterTotais() : 'Afastamento Prazo Indeterminado'}
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
                            style={{ minWidth: tableData?.filter(({ obsafa }) => obsafa).length ? '25%' : '40%' }}
                            body={({ desdoe }) => (
                                <textarea
                                    style={{ border: 'none', width: '100%', background: 'none', resize: 'none', color: '#212529' }}
                                    disabled
                                    rows={3}
                                    value={desdoe}>
                                </textarea>
                            )}
                        />
                        <Column
                            hidden={!tableData?.filter(({ obsafa }) => obsafa).length}
                            header='Observação'
                            field="obsafa"
                            style={{ minWidth: '25%' }}
                            body={({ obsafa }) => (
                                <textarea
                                    style={{ border: 'none', width: '100%', background: 'none', resize: 'none', color: '#212529' }}
                                    disabled
                                    rows={3}
                                    value={obsafa}>
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
                        options={listaSituacoes}
                        onChange={({ value }) => setState({ ...state, situacao: value })}
                        value={state.situacao}
                        optionLabel='label'
                    />
                </div>
                <div className="col-12 lg:col-offset-4 lg:col-2 field">
                    <FieldName name='Início' />
                    <Datepicker
                        // minDate={obterDataMinInicio()}
                        showOnFocus={false}
                        value={state.dataInicio}
                        onChange={({ value }) => {
                            if (value) {
                                setState({
                                    ...GLOBAL.tarefa_2,
                                    dataInicio: value,
                                    dataTermino: null,
                                    quantidadeDias: null,
                                    prevDataTermino: null,
                                    prevQuantidadeDias: null
                                })
                            }
                        }}
                        className="w-full"
                    />
                </div>
                <div className="col-12 lg:col-2 field">
                    <FieldName name='Hora de Início' />
                    <div className="card flex justify-content-center">
                        <Calendar value={state.horaInicio} onChange={(e) => setState({ ...GLOBAL.tarefa_2, horaInicio: e.target.value })} timeOnly className={`w-full`} />
                    </div>
                </div>
                {
                    datult &&
                    <div className="col-12 lg:col-2 field">
                        <FieldName name='Ultima data trabalhada' />
                        <InputText
                            readOnly
                            className="w-full"
                            value={datult}
                        />
                    </div>
                }
                <div className="col-6 lg:col-2 field">
                    <FieldName name='Qntd. Dias Término' />
                    <InputNumber
                        min={0}
                        className="w-full"
                        inputClassName="w-full"
                        value={state.quantidadeDias}
                        onChange={({ value }) => {
                            setState({ ...state, quantidadeDias: value })
                        }}
                    />
                </div>
                <div className="col-6 lg:col-3 field">
                    <FieldName name='Término' />
                    <Datepicker
                        // disabled
                        showButtonBar={true}
                        onClearButtonClick={() => {
                            setState({ ...GLOBAL.tarefa_2, dataTermino: undefined, quantidadeDias: undefined, })
                        }}
                        minDate={state.dataInicio}
                        showOnFocus={false}
                        className='w-full'
                        onChange={({ value }) => {
                            if (value) {
                                setState({ ...GLOBAL.tarefa_2, dataTermino: value })
                            }
                        }}
                        value={state.dataTermino}
                    />
                </div>
                <div className="col-12 lg:col-2 field">
                    <FieldName name='Hora de Término' />
                    <div className="card flex justify-content-center">
                        <Calendar value={state.horaTermino} onChange={(e) => setState({ ...GLOBAL.tarefa_2, horaTermino: e.target.value })} timeOnly className={`w-full`} minDate={state.horaInicio} disabled={!state.horaInicio} />
                    </div>
                </div>
                <div className="lg:col-7"></div>
                <div className="col-6 lg:col-2 field">
                    <FieldName name='Prev. Dias Término' />
                    <InputNumber
                        min={0}
                        className="w-full"
                        inputClassName="w-full"
                        value={state.prevQuantidadeDias}
                        onChange={({ value }) => setState({ ...state, prevQuantidadeDias: value })}
                    />
                </div>
                <div className="col-6 lg:col-3 field">
                    <FieldName name='Previsão Término' />
                    <Datepicker
                        // disabled
                        showButtonBar={true}
                        onClearButtonClick={() => {
                            setState({ ...GLOBAL.tarefa_2, prevDataTermino: undefined, prevQuantidadeDias: undefined, })
                        }}
                        minDate={state.dataInicio}
                        showOnFocus={false}
                        className='w-full'
                        value={state.prevDataTermino}
                        onChange={({ value }) => {
                            if (value) {
                                setState({ ...GLOBAL.tarefa_2, prevDataTermino: value })
                            }
                        }}
                    />
                </div>
                <div className="grid px-2" style={{ display: !novoAfastamentoVisible ? 'none' : '' }}>
                    <ContentDivisor icon='pi pi-tag' content={`Novo Afastamento`} />
                    <div className="col-12 lg:col-4 field">
                        <FieldName name='Situação' />
                        <Dropdown
                            className="w-full"
                            options={listaSituacoes}
                            value={state.novaSituacao}
                            onChange={({ value }) => setState({ ...state, novaSituacao: value })}
                            optionLabel='label'
                        />
                    </div>
                    <div className="col-12 lg:col-offset-6 lg:col-2 field">
                        <FieldName name='Início' />
                        <Datepicker
                            disabled
                            showOnFocus={false}
                            value={state.novaDataInicio}
                            onChange={({ value }) => {
                                if (value) {
                                    setState({
                                        ...GLOBAL.tarefa_2,
                                        novaDataInicio: value,
                                        novaDataTermino: null,
                                        novaQuantidadeDias: null,
                                        novaPrevDataTermino: null,
                                        novaPrevQuantidadeDias: null
                                    })
                                }
                            }}
                            className="w-full"
                        />
                    </div>
                    <div className="col-6 lg:col-2 field">
                        <FieldName name='Qntd. Dias Término' />
                        <InputNumber
                            disabled={!globalState.variaveisProcesso.quantidadeDiasAfastamento}
                            className="w-full"
                            inputClassName="w-full"
                            value={state.novaQuantidadeDias}
                            onChange={({ value }) => setState({ ...state, novaQuantidadeDias: value })}
                        />
                    </div>
                    <div className="col-6 lg:col-3 field">
                        <FieldName name='Término' />
                        <Datepicker
                            disabled
                            showOnFocus={false}
                            className='w-full'
                            value={state.novaDataTermino}
                            onChange={({ value }) => {
                                if (value) {
                                    setState({ ...GLOBAL.tarefa_2, novaDataTermino: value })
                                }
                            }}
                        />
                    </div>
                    <div className="lg:col-6"></div>
                    <div className="col-6 lg:col-2 field">
                        <FieldName name='Prev. Dias Término' />
                        <InputNumber
                            value={state.novaPrevQuantidadeDias}
                            onChange={({ value }) => setState({ ...state, novaPrevQuantidadeDias: value })}
                            className="w-full"
                            inputClassName="w-full"
                        />
                    </div>
                    <div className="col-6 lg:col-3 field">
                        <FieldName name='Previsão Término' />
                        <Datepicker
                            disabled
                            value={state.novaPrevDataTermino}
                            onChange={({ value }) => {
                                if (value) {
                                    setState({ ...GLOBAL.tarefa_2, novaPrevDataTermino: value })
                                }
                            }}
                            className='w-full'
                        />
                    </div>
                </div>
                <div className="col-12 flex justify-content-center pr-3">
                    <Button
                        icon={!novoAfastamentoVisible ? 'pi pi-plus' : 'pi pi-times'}
                        className={`p-button-rounded hidden`}
                        onClick={novoAfastamento}
                        type='button'
                    />
                </div>
                <div className="col-12 field">
                    <FieldName name='Descrição' />
                    <InputTextarea
                        className="w-full"
                        rows={4}
                        // disabled
                        value={state.descricao}
                    />
                </div>

                <ContentDivisor icon={"fa-solid fa-briefcase-medical"} content='SESMT' />

                <div className="col-12 lg:col-6 field">
                    <FieldName name='Atendente' required={!state.situacao.sesmt && !state.novaSituacao?.sesmt} />
                    <InputText
                        className={`w-full ${!state.situacao.sesmt && !state.novaSituacao?.sesmt ? "obrigatorio" : ''}`}
                        value={state.atendente}
                        onChange={(ev) => setState({ ...state, atendente: ev.target.value })}
                    />
                </div>
                <div className="col-12 lg:col-6 field">
                    <FieldName name='Órgão de Classe' required={!state.situacao.sesmt && !state.novaSituacao?.sesmt} />
                    <Dropdown
                        className="w-full"
                        value={state.orgaoClasse}
                        options={obterListaOrgaoDeClasse()}
                        optionLabel='descricao'
                        onChange={({ value }) => setState({ ...state, orgaoClasse: value })}
                    />
                </div>
                <div className="col-12 lg:col-2 field">
                    <FieldName name='Reg. Conselho Prof.' required={!state.situacao.sesmt && !state.novaSituacao?.sesmt} />
                    <InputNumber
                        useGrouping={false}
                        className={`w-full ${!state.situacao.sesmt && !state.novaSituacao?.sesmt ? "obrigatorio" : ''}`}
                        inputClassName="w-full"
                        value={state.regConselhoProf}
                        onChange={({ value }) => setState({ ...state, regConselhoProf: value })}
                    />
                </div>
                <div className="col-12 lg:col-offset-4 lg:col-6 field">
                    <FieldName name='UF Conselho Prof.' required={!state.situacao.sesmt && !state.novaSituacao?.sesmt} />
                    <AutoComplete
                        forceSelection
                        value={state.ufConselhoProf}
                        suggestions={ufOptions}
                        completeMethod={buscarEstadoUF}
                        field='nome'
                        onChange={({ value }) => setState({ ...state, ufConselhoProf: value })}
                        inputClassName='w-full'
                        className={`w-full erroUf ${!state.situacao.sesmt && !state.novaSituacao?.sesmt ? "obrigatorio" : ''}`}
                    />
                    {
                        !state.ufConselhoProf?.uf &&
                        <small id="erroUfMsg" className="p-error hidden">Voce não selecionou um estado.</small>
                    }
                </div>
                <div className="col-12 field">
                    <FieldName name='CID' />
                    <div className="flex flex-row align-items-center w-full">
                        <span className='p-input-icon-right'>
                            {
                                loadingCID &&
                                <i className='pi pi-spin pi-spinner'></i>
                            }
                            <InputText
                                value={state.cid.codcid}
                                className='w-8rem mr-2 w-full'
                                onChange={({ target }) => setState({ ...state, cid: { ...state.cid, codcid: target.value.toUpperCase() } })}
                                onKeyDown={({ key }) => {
                                    if (key == 'Enter') {
                                        buscarCid();
                                    }
                                }}
                                onBlur={buscarCid}
                            />
                        </span>
                        <span className="text-700 text-sm">
                            {
                                state.cid.codcid ? state.cid.descid : ''
                            }
                        </span>
                    </div>
                </div>
                <div className="col-12 field">
                    <FieldName name='Descrição SESMT' />
                    <InputTextarea
                        rows={4}
                        className='w-full'
                        value={state.descricaoSesmt}
                        onChange={({ target }) => setState({ ...state, descricaoSesmt: target.value })}
                    />
                </div>
                <div className="col-12 lg:col-4">
                    {/* {
                        (globalState.variaveisProcesso?.tarefa2_JSON?.requerimentoId) &&
                        <div className="col-12 lg:col-4">
                            <Button
                                className="w-full"
                                // onClick={() => exibirAnexo(globalState.variaveisProcesso?.tarefa2_JSON?.requerimentoBase64.base64)}
                                onClick={async () => {
                                    const token = globalState.dadosPlataforma.token.access_token
                                    const url = await downloadAttachment(token, globalState.variaveisProcesso?.tarefa2_JSON?.requerimentoId)
                                    window.open(url)
                                }}
                                label="Download do Requerimento Anterior"
                                type="button"
                            />
                        </div>
                    } */}
                    <FileUpload
                        // ref={anexoRequerimentoRef}
                        name='Anexo Requerimento'
                        mode='advanced'
                        accept='image/*, .pdf'
                        auto
                        multiple
                        customUpload
                        emptyTemplate={
                            <p className='m-0 text-center'>Arraste e solte aqui os arquivos.</p>
                        }
                        className="w-full"
                        uploadHandler={event => setState(prev => ({ ...prev, anexosSESMT: event.files }))}
                        onRemove={event => {
                            setState(prev => {
                                const newFiles = prev?.anexosSESMT?.filter(file => file.name !== event.file.name)
                                return { ...prev, anexosSESMT: newFiles }
                            })
                        }}
                        chooseOptions={{ icon: 'pi pi-file', label: 'Anexar Arquivos', className: 'p-button-outlined w-full' }}
                    />
                </div>
                {/* <div className="col-12 lg:col-3">
                    {
                        (globalState.variaveisProcesso?.tarefa2_JSON?.requerimentoId) &&
                        <div className="col-12 lg:col-4">
                            <Button
                                className="w-full"
                                // onClick={() => exibirAnexo(globalState.variaveisProcesso?.tarefa2_JSON?.cartaBase64.base64)}
                                onClick={async () => {
                                    const token = globalState.dadosPlataforma.token.access_token
                                    const url = await downloadAttachment(token, globalState.variaveisProcesso?.tarefa2_JSON?.cartaId)
                                    window.open(url)
                                }}
                                label="Download da Carta Anterior"
                                type="button"
                            />
                        </div>
                    }
                    <FileUpload
                        ref={anexoCartaRef}
                        name='Anexo Carta'
                        mode='basic'
                        accept='image/*, .pdf'
                        auto
                        customUpload
                        uploadHandler={inserirAnexoCarta}
                        chooseOptions={{ icon: 'pi pi-file', label: 'Anexar Carta Orientativa', className: 'p-button-outlined w-full' }}
                    />
                </div> */}
                {/* <div className="col-12 lg:col-9 flex align-items-center">
                    {state.carta?.nome}
                </div> */}
                <div className="col-12">
                    <DataTable
                        value={todosAfastamentos}
                        emptyMessage={'Nenhum resultado encontrado'}
                        loading={todosAfastamentos == []}
                        size='small'
                        accept='application/pdf'
                        scrollable
                        scrollHeight='20rem'
                        header='Consulta Afastamento'
                        tableClassName='text-700'
                    >
                        <Column
                            header='Situação'
                            field='dessit'
                        />
                        <Column
                            header='Data Início'
                            field='datafa'
                        />
                        <Column
                            header='Data Término'
                            field='datter'
                        />
                    </DataTable>
                </div>
            </div>
        </form >
    )
}

const Style = {
    label: 'text-700'
}