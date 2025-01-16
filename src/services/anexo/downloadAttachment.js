import axios from "axios"

export async function downloadAttachment(token, id) {
  const config = {
    headers: { Authorization: `bearer ${token}` }
  }

  const body = {
    id
  }
  const responseUrl = (await axios.post('https://platform.senior.com.br/t/senior.com.br/bridge/1.0/rest/platform/workflow/queries/requestAttachmentAccess', body, config)).data.accessUrl

  return responseUrl
}