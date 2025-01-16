import { setMessage } from "../globalState"
import { commitAttachment } from "../services/anexo/commitAttachment"
import { linkAttachments } from "../services/anexo/linkAttachments"
import { newAttachment } from "../services/anexo/newAttachment"
import { uploadFile } from "../services/anexo/uploadFile"

export async function sendAnexo(token, processInstanceId, arq) {
  // const token = globalState.dadosPlataforma.token.access_token
  try {
    const uploadInfo = await newAttachment(token, arq.name, arq.size)
    console.log(arq.name, uploadInfo)
    await uploadFile(uploadInfo, arq)
    await commitAttachment(
      token,
      uploadInfo.attachment.id
    )
    if (processInstanceId) {
      await linkAttachments(
        token,
        [uploadInfo.attachment.id],
        processInstanceId
      )
      // setMessage({ severity: 'success', summary: 'Arquivo anexado com sucesso!', life: 10000 });
      // alert(`Anexo ${arq.name} inserido com sucesso!`)
      console.log(`Anexo ${arq.name} inserido com sucesso!`);
    }
    return uploadInfo.attachment.id
  } catch (e) {
    console.log(`Erro ao enexar arquivo ${arq.name}`);
    alert(`Erro ao enexar arquivo ${arq.name}`)
    setMessage({ severity: 'error', summary: 'Erro ao anexar arquivo', life: 10000 });
    throw new Error(`Erro ao enexar arquivo ${arq.name}. Erro: ${e?.message ? e.message : e}`)
  }
}