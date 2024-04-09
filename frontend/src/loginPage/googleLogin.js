import { GoogleLoginService } from '../googleLoginService';
import { googleSignIn } from '../api';
import { renderLoginPageError } from './renderLoginPageError';

new GoogleLoginService(
  async (credential) => {
    try {
      await googleSignIn(credential);

      document.location.href = `${document.location.origin}/dashboard`;
    } catch (error) {
      renderLoginPageError(error);
    }
  },
  renderLoginPageError
);
