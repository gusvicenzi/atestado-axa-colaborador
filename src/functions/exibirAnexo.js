import findSring from './findString';

export default function exibirAnexo(anexo) {
    let pdfWindow = window.open();
    if (findSring(anexo, 'data:image')) {
        pdfWindow.document.write(`<div><img style="width:fit-content" src="${anexo}"></div>`)
        pdfWindow.document.querySelector('body').setAttribute('style', 'margin: 0;display: flex;/* align-items: center; */justify-content: center;background: #333333;')
    } else {
        pdfWindow.document.write(`<iframe src="${anexo}"style="width: 100vw; height: 100vh"></iframe>`)
        pdfWindow.document.querySelector('body').setAttribute('style', 'margin: 0;')
    }
}