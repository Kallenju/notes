import { getGoogleCSRFToken } from './api';
import { config } from './config';

class GoogleLoginService {
  constructor(signInCb, onErrorLoadHandler) {
    this.signInCb = signInCb;
    this.onErrorLoadHandler = onErrorLoadHandler;

    this.googleSDKPromiseResolve = null;
    this.googleSDKPromiseReject = null;
    this.googleSDKPromise = new Promise((resolve, reject) => {
      this.googleSDKPromiseResolve = resolve;
      this.googleSDKPromiseReject = reject;
    }).catch((error) => { this.onErrorLoadHandler(error) });

    this.initGoogleSDK();
  }

  initGoogleSDK() {
    if (config.isDevelopment) {
      this.googleSDKPromiseResolve();

      return;
    }

    const googleSDKScript = document.createElement('script');

    googleSDKScript.setAttribute('async', '');
    googleSDKScript.setAttribute('defer', '');
    googleSDKScript.setAttribute('src', 'https://accounts.google.com/gsi/client');

    googleSDKScript.addEventListener('error', (event) => {
      this.googleSDKPromiseReject(event.error);
    });

    googleSDKScript.addEventListener('load', async () => {
      try {
        window.google.accounts.id.initialize({
          client_id: '1093698814286-tg0p4hvddp64lh6b7o0bpl4cq4lp7i4v.apps.googleusercontent.com',
          callback: async (response) => await this?.signInCb(response.credential),
          auto_select: false,
          cancel_on_tap_outside: true,
          nonce: this.signInCb ? await getGoogleCSRFToken().then(({ token }) => token) : undefined,
          ux_mode: 'popup',
        });

        if (this.signInCb) {
          const googleButtonParent = document.body.querySelector('div#google-sign-in-button-container');

          if (!googleButtonParent) {
            this.googleSDKPromiseReject(new Error('Cannot find Google sign in button container'));

            return;
          }

          window.google.accounts.id.renderButton(
            googleButtonParent,
            {
              type: 'standard',
              theme: 'outline',
              size: 'large',
            }
          );
        }

        this.googleSDKPromiseResolve();
      } catch (error) {
        this.googleSDKPromiseReject(error);
      }
    }, { once: true });

    document.head.append(googleSDKScript)
  }

  async signout() {
    if (config.isDevelopment) {
      return;
    }

    await this.googleSDKPromise;

    window.google.accounts.id.disableAutoSelect();
  }
}

export { GoogleLoginService };
