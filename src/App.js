import { useEffect, useState } from "react"
import useGlobalState, { setMessage } from "./globalState"
import findSring from "./functions/findString";
import Tarefa_1 from "./pages/Tarefa_1";
import GLOBAL from './integration/storage.json';
import Tarefa_2 from "./pages/Tarefa_2";
import { Messages } from 'primereact/messages'
import Tarefa_3 from "./pages/Tarefa_3";
import Tarefa_4 from "./pages/Tarefa_4";
import changeTaskNumber from "./functions/changeTaskNumber";

export default function App({ data, info }) {
  const { globalState, setGlobalState, globalMsg } = useGlobalState();
  const [tarefaAtiva, setTarefaAtiva] = useState(null);

  useEffect(() => {
    setGlobalState(data);
  }, [data]);

  useEffect(() => {
    info.getTaskData().then(task => changeTaskNumber(task, setTarefaAtiva));
  }, [])

  console.log('tarefa', tarefaAtiva)
  function renderPage() {
    if (tarefaAtiva == 1) {
      return <Tarefa_1 />
    } else if (tarefaAtiva == 2) {
      return <Tarefa_2 />
    } else if (tarefaAtiva == 3) {
      return <Tarefa_1 />
    } else {
      return <Tarefa_4 />
    }
    // else if (tarefaAtiva == 4 || tarefaAtiva == 5) {
    //   return <Tarefa_4 />
    // } else if (tarefaAtiva == 6 || tarefaAtiva == 7) {
    //   return <Tarefa_1 />
    // } 
  }

  if (globalState) {
    return (
      <div className="p-1">
        <Messages ref={globalMsg} />
        {renderPage()}
      </div>
    )
  }
}