// função para definir um tempo limite para resposta de uma promise
export async function fulfillWithTimeLimit(timeLimit, task, failureValue) {
  let timeout;
  const timeoutPromise = new Promise((resolve, reject) => {
    timeout = setTimeout(() => {
      resolve(failureValue);
    }, timeLimit);
  });
  const response = await Promise.race([task, timeoutPromise]);
  if (timeout) {  // limpar o timeout por segurança
    clearTimeout(timeout);
  }
  return response;
}