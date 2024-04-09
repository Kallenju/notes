import { renderDashboardError } from './renderDashboardError';
import { logout } from '../api';
import { GoogleLoginService } from '../googleLoginService';

const googleLoginService = new GoogleLoginService(null, renderDashboardError);

const logoutButton = document.body.querySelector('button#logout-button');

if (logoutButton) {
  logoutButton.addEventListener('click', async (event) => {
    event.preventDefault();

    try {
      logoutButton?.setAttribute('disabled', '');

      await googleLoginService.signout();
      await logout();

      document.location.href = `${document.location.origin}/`;
    } catch (error) {
      renderDashboardError(error);
    } finally {
      logoutButton?.removeAttribute('disabled', '');
    }
  })
}
