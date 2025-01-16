import axios from "axios"

export async function commitAttachment(token, id) {
  const config = {
    headers: { Authorization: `bearer ${token}` }
  }

  const body = {
    id
  }
  const commitResponse = await (await axios.post('https://platform.senior.com.br/t/senior.com.br/bridge/1.0/rest/platform/workflow/actions/commitAttachment', body, config)).data

  return commitResponse
}