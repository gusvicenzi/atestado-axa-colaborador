import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { useEffect, useState } from "react";
import FieldName from "../components/FieldName";
import useGlobalState from "../globalState";
import getAfastamentos60Dias from "../services/getAfastamentos60Dias";
import ContentDivisor from "../components/ContentDivisor";
import { addDays } from "date-fns";
import GLOBAL from '../integration/storage.json'
import exibirAnexo from "../functions/exibirAnexo";

export default function Tarefa_3() {
    const { globalState } = useGlobalState();
    console.log(globalState)
    let initialState = globalState.variaveisProcesso.tarefa2_JSON;
    initialState.dataInicio = new Date(initialState.dataInicio);
    initialState.dataTermino = new Date(initialState.dataTermino);
    initialState.novaDataInicio = new Date(initialState.novaDataInicio);
    initialState.novaDataTermino = new Date(initialState.novaDataTermino);
    const [state, setState] = useState(initialState);
    const [tableData, setTableData] = useState([]);

    let totais = {
        licencaMedica: 0,
        auxDoenca: 0,
        quantidadeDiasSolitado: globalState.variaveisProcesso.tarefa1_JSON.quantidadeDias,
    };

    console.log(tableData)

    if (tableData?.length) {
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

    useEffect(() => {
        getAfastamentos60Dias(globalState.dadosPlataforma.token.access_token,
            globalState.usuario.subject,
            new Date(globalState.variaveisProcesso.dataInicioAfastamento).toLocaleDateString()
        ).then(data => setTableData(data));
    }, [])

    useEffect(() => {
        GLOBAL.tarefa_3 = state;
    }, [state])

    return (
        <form>
            <div className="grid">
                <ContentDivisor icon='pi pi-user' content='Solicitante' />

                <div className="col-12 lg:col-3 field">
                    <FieldName name='Matrícula' />
                    <InputText
                        className="w-full"
                        disabled
                        value={globalState.variaveisProcesso.cadastroSolicitante}
                    />
                </div>
                <div className="lg:col-9 field"></div>
                <div className="col-12 lg:col-6 field">
                    <FieldName name='Empregado' />
                    <InputText
                        className="w-full"
                        disabled
                        value={globalState.variaveisProcesso.nomeSolicitante}
                    />
                </div>
                <div className="lg:col-6"></div>
                <div className="col-12 lg:col-2">
                    <Button
                        type="button"
                        onClick={() => exibirAnexo(globalState.variaveisProcesso.anexoBase64)}
                        label='Exibir Anexo'
                    />
                </div>
                <div className="col-12">
                    <Card subTitle='Decisão sobre o Afastamento' >
                        <div className="grid">
                            <div className="col-12 lg:col-8 text-sm">
                                De acordo com o histórico de afastamento dos ultimos 60 dias, você ultrapassou
                                o limite de 15 dias de atestado e portanto terá que optar por se afastar pelo INSS
                                ou descontar os dias como faltas na próxima folha de pagamento.
                            </div>
                            <div className="col-12 font-normal">
                                Saldo dias INSS ou Faltas: {totais.sugestaoDiasAuxDoenca} <br /> Data Inicio: {addDays(state.dataInicio, (totais.diasAtestadosDisponiveis > 0 ? totais.diasAtestadosDisponiveis + 1 : 0)).toLocaleDateString()}
                            </div>
                            <div className="col-12 lg:col-3 field">
                                <Dropdown
                                    value={state.decisao}
                                    placeholder="Selecione uma opção"
                                    className="w-full obrigatorio"
                                    optionLabel="label"
                                    onChange={({ value }) => setState({ ...state, decisao: value })}
                                    options={[
                                        { label: 'Afastar pelo INSS', value: 'afastar' },
                                        { label: 'Descontar como Faltas na próxima folha de pagamento', value: 'faltar' }
                                    ]}
                                />
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </form>
    )
}

const Style = {
    label: 'text-700'
}