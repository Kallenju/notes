import { renderDashboardError } from './renderDashboardError';
import { logout } from '../api';
import { GoogleLoginService } from '../googleLoginService';
import { FacebookLoginService } from '../facebookLoginService';

const googleLoginService = new GoogleLoginService(null, renderDashboardError);
const facebookLoginService = new FacebookLoginService(renderDashboardError);

const logoutButton = document.body.querySelector('button#logout-button');

if (logoutButton) {
  logoutButton.addEventListener('click', async (event) => {
    event.preventDefault();

    try {
      logoutButton?.setAttribute('disabled', '');

      await googleLoginService.signout();
      await facebookLoginService.logout();
      await logout();

      document.location.href = `${document.location.origin}/`;
    } catch (error) {
      renderDashboardError(error);
    } finally {
      logoutButton?.removeAttribute('disabled', '');
    }
  })
}
