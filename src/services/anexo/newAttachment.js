import axios from "axios"

export async function newAttachment(token, name, size) {
  const config = {
    headers: { Authorization: `bearer ${token}` }
  }

  const body = {
    name,
    size
  }
  const uploadInfo = await (await axios.post('https://platform.senior.com.br/t/senior.com.br/bridge/1.0/rest/platform/workflow/actions/newAttachment', body, config)).data

  return uploadInfo
}