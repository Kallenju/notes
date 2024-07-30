import { FacebookLoginService } from '../facebookLoginService';
import { renderLoginPageError } from './renderLoginPageError';
import { facebookSignIn } from '../api';

const facebookLoginService = new FacebookLoginService(renderLoginPageError);

facebookLoginService.addAuthChangeHandlers('login', async (response, type) => {
  if (
    response.status !== 'connected' ||
    (
      type === 'manual' && (
        !response.authResponse.grantedScopes.includes('email') ||
        !response.authResponse.grantedScopes.includes('public_profile')
      )
  )
  ) {
    return;
  }

  try {
    await facebookSignIn({
      facebookUserId: response.authResponse.userID,
      facebookAccessToken: response.authResponse.accessToken,
    });

    document.location.href = `${document.location.origin}/dashboard`;
  } catch (error) {
    renderLoginPageError(error);
  }
})

const facebookLoginServiceButton = document.body.querySelector('button#facebook-login-button');

if (facebookLoginServiceButton) {
  facebookLoginServiceButton.addEventListener('click', async (event) => {
    event.preventDefault();

    try {
      facebookLoginServiceButton?.setAttribute('disabled', '');

      await facebookLoginService.login();
    } catch (error) {
      renderLoginPageError(error);
    } finally {
      facebookLoginServiceButton?.removeAttribute('disabled', '');
    }
  })
}
