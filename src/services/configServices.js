const configServices = {
    baseUrl: 'https://platform.senior.com.br/t/senior.com.br/bridge/1.0/rest/platform/conector/actions/invoke',
    // externalServer: 'https://ocweb06s1p.seniorcloud.com.br:30151',
    // user: 'integracaobpm',
    // password: 'Senior@BPM',
    // AXA:
    externalServer: 'https://webp21.seniorcloud.com.br:30631',
    user: 'integracao.bpm',
    password: 'Senior@2025@',
    // mainhardt
    // externalServer: 'http://177.200.194.52:8080/',
    // user: 'senior',
    // password: 'senior',
}

const defaultInvoke = {
    id: 'f2200c3b-c7df-4040-9613-34f697b75889',
    inputData: {
        server: configServices.externalServer,
        module: 'rubi',
        service: 'com.senior.xplatform.bpm',
        user: configServices.user,
        password: configServices.password,
        encryption: '0',
        rootObject: ''
    }
}

module.exports = {
    configServices,
    defaultInvoke
}