import { sendAnexo } from "./sendAnexo"

// Função para inserirAnexos multiplos
export async function inserirAnexos(event, globalState, uploadRef, setState) {
  uploadRef.current.clear();
  const files = event.files;
  const kbs = files.map(file => {
    if (file.size / 1000 <= 5010) {
      return true
    } else {
      return false
    }
  })
  console.log(kbs)
  if (kbs.reduce((total, current) => total && current)) {
    let idsAnexos = []
    files.forEach(async (file) => {
      const id = await sendAnexo(globalState.dadosPlataforma.token.access_token,
        globalState.data.processInstanceId, file)
      idsAnexos.push(id)
      alert(`Anexo ${file.name} inserido com sucesso!`)
    })
    if (setState) {
      setState(prev => { return { ...prev, idsAnexos } })
    }
  } else {
    alert('O Arquivo Selecionado Excedeu o Limite de 5mb');
  }
}