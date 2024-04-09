export function renderDashboardError(error) {
  const main = document.body.querySelector('div#main');

  if (!main) {
    return;
  }

  const currentError = main.querySelector('div.uk-alert.uk-alert-danger > p');

  const errorText = error
    ? error instanceof Error
    ? error.message
    : typeof error === 'object'
    ? JSON.stringify(error)
    : String(error)
    : 'Something went wrong.'

  if (currentError) {
    currentError.textContent = errorText;

    return;
  }

  const container = document.createElement('div');

  container.classList.add('uk-alert', 'uk-alert-danger');

  const errorDesc = document.createElement('p');

  errorDesc.textContent = errorText;

  container.append(errorDesc);

  main.append(container);

  return;
}
