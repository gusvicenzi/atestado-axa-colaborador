import axios from "axios"

export async function linkAttachments(token, ids, processInstance) {
  const config = {
    headers: { Authorization: `bearer ${token}` }
  }

  const body = {
    ids,
    processInstance
  }
  const linkResponse = await (await axios.post('https://platform.senior.com.br/t/senior.com.br/bridge/1.0/rest/platform/workflow/actions/linkAttachments', body, config)).data

  return linkResponse
}