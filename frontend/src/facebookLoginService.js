import { config } from './config';

class FacebookLoginService {
  constructor(onErrorLoadHandler) {
    this.shouldReRequest = false;
    this.permissionsToBeRequested = ['email', 'public_profile'];

    this.facebookSDKPromiseResolve = null;
    this.facebookSDKPromiseReject = null;
    this.facebookSDKPromise = new Promise((resolve, reject) => {
      this.facebookSDKPromiseResolve = resolve;
      this.facebookSDKPromiseReject = reject;
    }).catch((error) => { onErrorLoadHandler(error) });

    this.loginHandlers = [];
    this.logoutHandlers = [];

    this.initFacebookSDK();
  }

  initFacebookSDK() {
    if (config.isDevelopment) {
      this.facebookSDKPromiseResolve();

      return;
    }

    const facebookSDKScript = document.createElement('script');

    facebookSDKScript.setAttribute('async', '');
    facebookSDKScript.setAttribute('defer', '');
    facebookSDKScript.setAttribute('crossorigin', 'anonymous');
    facebookSDKScript.setAttribute('src', 'https://connect.facebook.net/en_US/sdk.js');

    facebookSDKScript.addEventListener('error', (event) => {
      this.facebookSDKPromiseReject(event.error);
    });

    facebookSDKScript.addEventListener('load', () => {
      window.FB.init({
        appId: '1489613968561902',
        xfbml: false,
        status: false,
        version: 'v19.0'
      });

      window.FB.Event
        .subscribe(
          'auth.login',
          async (response) => {
            await Promise.all(
              this.loginHandlers.map(async (handler) => handler(response, 'manual'))
            );
          }
        );

      window.FB.Event
        .subscribe(
          'auth.logout',
          async (response) => {
            await Promise.all(
              this.logoutHandlers.map(async (handler) => handler(response))
            );
          }
        );

      this.facebookSDKPromiseResolve();

      this.getLoginStatus()
        .then(async response => {
          await Promise.all(
            this.loginHandlers.map(async (handler) => handler(response, 'auto'))
          );
        })
        .catch(() => {
          throw new Error('Error to get Facebook login status')
        })
    }, { once: true });

    document.head.append(facebookSDKScript)
  }

  async getLoginStatus() {
    if (config.isDevelopment) {
      return;
    }

    await this.facebookSDKPromise;

    return new Promise((resolve, reject) => {
      window.FB.getLoginStatus(
        (response) => {
          try {
            resolve(response)
          } catch (error) {
            reject(error);
          }
        },
        false
      );
    })
  }

  async login() {
    if (config.isDevelopment) {
      return;
    }

    await this.facebookSDKPromise;

    return new Promise(async (resolve, reject) => {
      const isloggedIn = await this.getLoginStatus()
        .then(response => response.status === 'connected')
        .catch(() => false);

      if (isloggedIn) {
        return null;
      }

      window.FB.login(
        (response) => {
          try {
            const grantedScopes = response.authResponse.grantedScopes.split(',');

            this.permissionsToBeRequested = this.permissionsToBeRequested.filter((permission) => !grantedScopes.includes(permission));

            if (this.permissionsToBeRequested.length) {
              this.shouldReRequest = true;

              reject('Requested permissions have not been granted');

              return;
            }

            resolve(response);
          } catch (error) {
            reject(error);
          }
        },
        {
          scope: this.permissionsToBeRequested.join(','),
          return_scopes: true,
          ...this.shouldReRequest ? { auth_type: 'rerequest' } : {}
        }
      );
    })
  }

  async logout() {
    if (config.isDevelopment) {
      return;
    }

    await this.facebookSDKPromise;

    return new Promise((resolve, reject) => {
      window.FB.logout((response) => {
        try {
          resolve(response)
        } catch (error) {
          reject(error);
        }
      });
    })
  }

  async api(fields) {
    if (config.isDevelopment) {
      return;
    }

    await this.facebookSDKPromise;

    const loginStatus = await this.getLoginStatus();

    if (!loginStatus?.authResponse.accessToken) {
      throw new Error('Please re-login.');
    }

    return new Promise((resolve, reject) => {
      window.FB.api(
        '/me',
        'get',
        {
          access_token: loginStatus.authResponse.accessToken,
          fields
        },
        (response) => {
          try {
            if (response.error) {
              reject(response.error);

              return;
            }

            resolve(response)
          } catch (error) {
            reject(error);
          }
        }
      )
    })
  }

  addAuthChangeHandlers(event, handler) {
    if (config.isDevelopment) {
      return;
    }

    switch (event) {
      case 'login': {
        this.loginHandlers.push(handler);

        break;
      }
      case 'logout': {
        this.logoutHandlers.push(handler);

        break;
      }
    }
  }
}

export { FacebookLoginService };
