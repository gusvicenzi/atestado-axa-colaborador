import { InputText } from 'primereact/inputtext';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { InputTextarea } from 'primereact/inputtextarea';
import { InputNumber } from 'primereact/inputnumber';
import { useEffect, useRef, useState } from 'react';
import useGlobalState from '../globalState';
// import getLiderados from '../services/getLiderados';
import { Dropdown } from 'primereact/dropdown';
import { FileUpload } from 'primereact/fileupload';
import { Datepicker } from '../components/Datepicker';
import getListaSituacoes from '../services/getListaSituacoes';
import { addDays, eachDayOfInterval } from 'date-fns';
import getAfastamentos60Dias from '../services/getAfastamentos60Dias';
import GLOBAL from '../integration/storage.json'
import { Button } from 'primereact/button';
import FieldName from '../components/FieldName';
import { Tooltip } from 'primereact/tooltip';
import exibirAnexo from '../functions/exibirAnexo';
import { onSelectFileToBase64 } from '../functions/onSelectFileToBase64';
import { Calendar } from 'primereact/calendar';
import retornoLider from '../services/retornoLider.js';
// import { downloadAttachment } from '../services/anexo/downloadAttachment';

export default function Tarefa_1() {
    const { globalState } = useGlobalState();
    const initialState = {
        usuario: null,
        situacao: null,
        dataInicio: null,
        horaInicio: null,
        quantidadeDias: null,
        dataTermino: null,
        horaTermino: null,
        descricaoAfastamento: '',
        anexo: null,
        empresa: null,
        solicitante: globalState.usuario
    }
    let revisao = globalState.variaveisProcesso?.tarefa1_JSON;
    if (revisao) {
        revisao.dataInicio = new Date(revisao.dataInicio);
        revisao.dataTermino = revisao.dataTermino ? new Date(revisao.dataTermino) : null;
    }
    const [usuariosFiltrados, setUsuariosFiltrados] = useState([]);
    const [state, setState] = useState(revisao || initialState);
    const [listaSituacoes, setListaSituacoes] = useState([]);
    const [tableData, setTableData] = useState([]);
    const anexoRef = useRef(null);
    // Inicialização
    useEffect(() => {
        retornoLider(globalState.dadosPlataforma.token.access_token, globalState.usuario.subject).then(({ usuario, empresa }) => {
            setState(prev => ({ ...prev, usuario, empresa }));
        });
        // getLiderados(globalState.dadosPlataforma.token.access_token, globalState.usuario.subject).then((liderados) => {
        //     setState(prev => ({ ...prev, liderados }));
        // });
        // getAfastamentos60Dias(globalState.dadosPlataforma.token.access_token, globalState.usuario.subject).then(data => {
        //     setTableData(data.lista);
        // });
        getListaSituacoes(globalState.dadosPlataforma.token.access_token).then(data => {
            setListaSituacoes(data);
        });
    }, []);

    // Busca afastamentos do usuário selecionado
    useEffect(() => {
        // if (state.usuario?.numemp)
        //     setState(prev => ({
        //         ...prev, empresa: {
        //             numemp: state.usuario.numemp,
        //             codfil: state.usuario.codfil,
        //             nomfil: state.usuario.nomfil

        //         }
        //     }))
        // else
        //     setState(prev => ({
        //         ...prev, empresa: null
        //     }))
        if (state.usuario)
            getAfastamentos60Dias(globalState.dadosPlataforma.token.access_token, state.usuario).then(data => {
                setTableData(data.lista);
            })
    }, [state.usuario])

    // Salvar variaveis do processo
    useEffect(() => {
        GLOBAL.consulta60Dias = tableData;
        GLOBAL.tarefa_1 = state;
        console.log('state', state);

    }, [state])

    useEffect(() => {
        if (state.dataInicio && state.quantidadeDias) {
            let dataTermino = addDays(state.dataInicio, state.quantidadeDias - 1);
            setState({ ...state, dataTermino });
        } else {
            setState({ ...state, dataTermino: null });
        }
    }, [state.quantidadeDias, state.dataInicio]);

    useEffect(() => {
        if (state.dataInicio && state.dataTermino) {
            let quantidadeDias = eachDayOfInterval({ start: state.dataInicio, end: state.dataTermino }).length;
            setState({ ...state, quantidadeDias });
        }
    }, [state.dataTermino])

    function handleRemoveFile(event) {
        // console.log('eventfile', event.file)
        // console.log('anexos antes', state.anexo, state.anexoBase64, state.anexo2, state.anexo2Base64)
        if (event?.file?.name === state.anexoBase64.nome) {
            setState(prev => { return { ...prev, anexoBase64: '', anexo: '' } })
        } else if (event?.file?.name === state.anexo2Base64.nome) {
            setState(prev => { return { ...prev, anexo2Base64: '', anexo2: '' } })
        }
    }

    // useEffect(() => {
    //     console.log('anexos depois', state.anexo, state.anexoBase64, state.anexo2, state.anexo2Base64)
    // }, [state])

    async function uploadBase64(event) {
        console.log(event.files)
        if (event.files.length > 2) {
            anexoRef.current.clear()
            alert('Selecione no máximo 2 arquivos.')
            return
        }
        onSelectFileToBase64(event.files[0], anexoRef, setState, 1)
        if (event.files.length > 1) {
            onSelectFileToBase64(event.files[1], anexoRef, setState, 2)
        }

    }

    return (
        <form id='form' className='formTarefa1' noValidate>
            <div className="grid-nogutter">
                {
                    globalState.variaveisProcesso?.descricaoSesmt &&
                    <div className='field col-12'>
                        <FieldName name='Descrição SESMT' />
                        <InputTextarea
                            className='w-full'
                            disabled
                            value={globalState.variaveisProcesso?.descricaoSesmt}
                            rows={4}
                        />
                    </div>
                }
                <div className="col-12 lg:col-6 field">
                    <FieldName required name='Colaborador' />
                    <span className='p-input-icon-right w-full'>
                        {
                            !state.usuario &&
                            <i className='pi pi-spin pi-spinner'></i>
                        }
                        <InputText
                            className='w-full obrigatorio'
                            value={state.usuario ? `${state.usuario?.numcad} - ${state.usuario?.nomfun}` : ''}
                            readOnly
                        />
                    </span>
                </div>
                <div className='lg:col-6'></div>
                <div className='col-12 lg:col-6 field'>
                    <FieldName
                        name='Empresa'
                    />
                    <span className='p-input-icon-right w-full'>
                        {
                            !state.empresa &&
                            <i className='pi pi-spin pi-spinner'></i>
                        }
                        <InputText
                            readOnly
                            className='w-full'
                            value={state.empresa ? `${state.empresa?.numemp} - ${state.empresa?.codfil} - ${state.empresa?.nomfil}` : ''}
                        />
                    </span>
                </div>
                <div className="col-12 field">
                    <FieldName name='Situação Afastamento' required />
                    <Dropdown
                        className='w-full obrigatorio'
                        optionLabel='dessit'
                        value={state.situacao}
                        options={listaSituacoes}
                        onChange={({ value }) => setState({ ...state, situacao: value })}
                    />
                </div>
                <div className="col-12 field">
                    <FieldName required name='Início do Afastamento' />
                    {/* <p className='text-red-500 text-sm'>Atestados com início a partir do dia 11/04/2024 devem ser lançado no novo sistema.  Dúvidas entrar em contato com o RH local.</p> */}
                    <Datepicker
                        // minDate={obterDataMinInicio()}
                        // maxDate={new Date('2024-04-11')}
                        className='w-full'
                        inputClassName='obrigatorio'
                        value={state.dataInicio}
                        onChange={({ value }) => {
                            setState({ ...GLOBAL.tarefa_1, dataInicio: value });
                            if (value) {
                                document.querySelector('.p-connected-overlay-enter-done').classList.add('hidden');
                            }
                        }}
                    />
                </div>
                <div className="col-12 field">
                    <FieldName name='Hora de Início do Afastamento' />
                    <div className="card flex justify-content-center">
                        <Calendar value={state.horaInicio} onChange={(e) => setState({ ...GLOBAL.tarefa_1, horaInicio: e.target.value })} timeOnly className={`w-full`} />
                    </div>
                </div>
                <div className="col-12 field">
                    <label className={Style.label}>Quantidade de Dias Afastamento</label>
                    <InputNumber
                        inputId='qntdDiasAfastamento'
                        className={`w-full`}
                        value={state.quantidadeDias}
                        useGrouping={false}
                        min={0}
                        max={999}
                        onChange={({ value }) => setState({ ...state, quantidadeDias: value })}
                    />
                </div>
                <div className="col-12 field">
                    <label className={Style.label}>Término Afastamento</label>
                    <Datepicker
                        // disabled
                        minDate={state.dataInicio}
                        className='w-full'
                        onChange={({ value }) => {
                            if (value) {
                                setState({ ...GLOBAL.tarefa_1, dataTermino: value })
                            }
                        }}
                        value={state.dataTermino}
                    />
                </div>
                <div className="col-12 field">
                    <FieldName name='Hora de Término do Afastamento' />
                    <div className="card flex justify-content-center">
                        <Calendar value={state.horaTermino} onChange={(e) => setState({ ...GLOBAL.tarefa_1, horaTermino: e.target.value })} timeOnly className={`w-full`} minDate={state.horaInicio} disabled={!state.horaInicio} />
                    </div>
                </div>
                <div className="col-12 field">
                    <FieldName name='Descrição' />
                    <InputTextarea
                        className='w-full'
                        rows={3}
                        maxLength={200}
                        placeholder="Limite de 200 caracteres."
                        value={state.descricaoAfastamento}
                        onChange={e => setState({ ...state, descricaoAfastamento: e.target.value })}
                    />
                </div>
                <div className="col-12 flex flex-column mb-2">
                    <FieldName name='Anexo Atestado / Afastamento' required />
                    <Tooltip target='#infoAnexo' content='Limite de 2 arquivos de 4MB | Extensões Aceitas: jpeg, jpg, bmp, png, pdf' />
                    <i className='pi pi-info-circle ml-2 text-700 col-1' id='infoAnexo'></i>
                    {
                        (globalState?.variaveisProcesso?.tarefa1_JSON?.anexoBase64) &&
                        <div className="col-12 lg:col-6 field">
                            <Button
                                className="w-full"
                                onClick={() => exibirAnexo(globalState.variaveisProcesso?.tarefa1_JSON?.anexoBase64.base64)}
                                label={`Exibir Anexo: ${globalState.variaveisProcesso?.tarefa1_JSON?.anexoBase64.nome}`}
                                type="button"
                            />
                        </div>
                    }
                    {
                        (globalState?.variaveisProcesso?.tarefa1_JSON?.anexo2Base64) &&
                        <div className="col-12 lg:col-6 field">
                            <Button
                                className="w-full"
                                onClick={() => exibirAnexo(globalState.variaveisProcesso?.tarefa1_JSON?.anexo2Base64.base64)}
                                label={`Exibir Anexo: ${globalState.variaveisProcesso?.tarefa1_JSON?.anexo2Base64.nome}`}
                                type="button"
                            />
                        </div>
                    }
                    <FileUpload
                        ref={anexoRef}
                        name='documento'
                        className='col-12 lg:col-6'
                        customUpload
                        uploadHandler={uploadBase64}
                        mode='advanced'
                        chooseLabel='Selecionar Arquivo'
                        multiple
                        maxFileSize="4000000"
                        invalidFileSizeMessageSummary='O arquivo excedeu o limite de tamanho.'
                        invalidFileSizeMessageDetail='Tamanho máximo é 4 MB'
                        onRemove={handleRemoveFile}
                        emptyTemplate={
                            <p className='m-0'>Arraste e solte aqui o arquivo.</p>
                        }
                        accept='.pdf,.PDF,image/*'
                        auto
                    />
                </div>
                {/* <div className="col-12 field">
                    {
                        (!globalState.novaSolicitacao && globalState.variaveisProcesso?.tarefa2_JSON?.requerimentoId) &&
                        <div className="col-12 lg:col-4">
                            <Button
                                className="w-full"
                                // onClick={() => exibirAnexo(globalState.variaveisProcesso?.tarefa2_JSON?.requerimentoBase64.base64)}
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
                                // onClick={() => exibirAnexo(globalState.variaveisProcesso?.tarefa2_JSON?.cartaBase64.base64)}
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
            </div>


            <DataTable
                value={tableData}
                emptyMessage={'Nenhum resultado encontrado'}
                loading={tableData == []}
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
        </form>
    )
}

const Style = {
    label: 'text-700'
}