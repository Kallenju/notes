export function renderLoginPageError(error) {
  const section = document.body.querySelector('section.uk-container.uk-margin-top.uk-margin-bottom');

  if (!section) {
    return;
  }

  const currentError = section.querySelector('div.uk-alert.uk-alert-danger > p');

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

  section.prepend(container);

  return;
}
