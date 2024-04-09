import { login } from '../api';
import { renderLoginPageError } from './renderLoginPageError';

const loginForm = document.body.querySelector('form#login-form');

if (loginForm) {
  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    try {
      loginForm.setAttribute('disabled', '');

      await login(loginForm.elements['email'].value, loginForm.elements['password'].value);

      document.location.href = `${document.location.origin}/dashboard`;
    } catch (error) {
      renderLoginPageError(error);
    } finally {
      loginForm.removeAttribute('disabled', '');
    }
  })
}
