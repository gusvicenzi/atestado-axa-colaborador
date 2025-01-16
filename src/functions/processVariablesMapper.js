import findSring from "./findString";

export default function processVariableMapper(processVariables) {
    if (processVariables.length) {
        let variaveisMapeadas = {};
        processVariables.map(({ key, value, type }) => {
            if (value) {
                if (findSring(key, '_JSON')) {
                    variaveisMapeadas[key] = JSON.parse(value);
                } else if (type == 'Integer') {
                    variaveisMapeadas[key] = parseInt(value);
                } else if (type == 'Double') {
                    variaveisMapeadas[key] = parseFloat(value);
                } else if (type == 'Date') {
                    variaveisMapeadas[key] = new Date(value);
                } else if (findSring(key, '_JSON')) {
                    variaveisMapeadas[key] = JSON.parse(value);
                } else {
                    variaveisMapeadas[key] = value;
                }
            } else {
                variaveisMapeadas[key] = null;
            }
        });
        return variaveisMapeadas;
    }
}