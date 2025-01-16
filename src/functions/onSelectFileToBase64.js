
export async function onSelectFileToBase64(file, anexoRef, setState, numeroAnexo) {
  const extensaoAnexo = file?.name?.split('.')?.at(-1)?.toLowerCase() || ''
  if (extensaoAnexo !== 'pdf' && extensaoAnexo !== 'png' && extensaoAnexo !== 'jpg' && extensaoAnexo !== 'jpeg' && extensaoAnexo !== 'bmp') {
    anexoRef.current.clear()
    // setState(prev => { return { ...prev, anexoBase64: '', anexo: '' } })
    alert('Tipo de arquivo inválido. Extensões Aceitas: jpeg, jpg, bmp, png, pdf')
    throw new Error('Tipo de arquivo inválido. Extensões Aceitas: jpeg, jpg, bmp, png, pdf')
  }

  if (numeroAnexo === 1) {
    let anexoBase64 = { nome: file.name };
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = function () {
      anexoBase64.base64 = reader.result;
      setState(prev => { return { ...prev, anexoBase64 } })
    }
    reader.addEventListener('error', (e) => {
      console.log(e)
      anexoRef.current.clear()
      setState(prev => { return { ...prev, anexoBase64: '', anexo: '' } })
      alert('Ocorreu um erro ao carregar o anexo. Tente novamente.')
      throw new Error('Erro ao carregar anexo')
    })
    setState(prev => { return { ...prev, anexo: file } })
  }

  if (numeroAnexo === 2) {
    let anexo2Base64 = { nome: file.name };
    const reader2 = new FileReader();
    reader2.readAsDataURL(file);
    reader2.onloadend = function () {
      anexo2Base64.base64 = reader2.result;
      setState(prev => { return { ...prev, anexo2Base64 } })
    }
    reader2.addEventListener('error', (e) => {
      console.log(e)
      anexoRef.current.clear()
      setState(prev => { return { ...prev, anexo2Base64: '', anexo2: '' } })
      alert('Ocorreu um erro ao carregar o anexo 2. Tente novamente.')
      throw new Error('Erro ao carregar anexo 2')
    })
    setState(prev => { return { ...prev, anexo2: file } })
  }
}