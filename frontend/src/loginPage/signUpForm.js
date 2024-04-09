import { signUp } from '../api';
import { renderLoginPageError } from './renderLoginPageError';

const signUpForm = document.body.querySelector('form#sign-up-form');

if (signUpForm) {
  signUpForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    try {
      signUpForm.setAttribute('disabled', '');

      await signUp(signUpForm.elements['email'].value, signUpForm.elements['password'].value);

      document.location.href = `${document.location.origin}/dashboard`;
    } catch (error) {
      renderLoginPageError(error);
    } finally {
      signUpForm.removeAttribute('disabled', '');
    }
  })
}
