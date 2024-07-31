import { FacebookLoginService } from '../facebookLoginService';
import { renderLoginPageError } from './renderLoginPageError';
import { facebookSignIn } from '../api';

const facebookLoginService = new FacebookLoginService(renderLoginPageError);

async function login(response, type) {
  if (
    !response ||
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
}

facebookLoginService.addAuthChangeHandlers('login', login)

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

facebookLoginServiceButton?.setAttribute('disabled', '');

facebookLoginService.getLoginStatus()
  .then(async response => {
    await login(response, 'auto');
  })
  .catch((error) => {
    renderLoginPageError(error);
  })
  .finally(() => {
    facebookLoginServiceButton?.removeAttribute('disabled', '');
  })
