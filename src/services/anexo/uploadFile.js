import axios from "axios"

export async function uploadFile(uploadInfo, file) {
  const extensaoAnexo = file?.name?.split('.')?.at(-1)?.toLowerCase() || ''
  let config = {
    method: 'PUT',
    maxBodyLength: Infinity,
    url: uploadInfo.uploadUrl,
    headers: { 'Content-Type': `${extensaoAnexo === 'pdf' ? 'application' : 'image'}/${extensaoAnexo}` },
    data: file
  }

  const uploadResponse = (await axios(config)).data
  return uploadResponse
}