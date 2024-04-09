import { Agent } from 'node:http';
import axios from 'axios';
import type { AxiosInstance } from 'axios';

import { config } from '../shared/config.js';
import { logger } from './logger.js';
import { StatusError } from '../shared/StatusError.js';

import { getMicroserviceAuthToken } from './jwt/microservice/getMicroserviceAuthToken.js';

class Backend {
  constructor() {
    this.backendToken = config.BACKEND_TOKEN;
    this.lastSuccessCallOFSetNewBackendTokenPromise = null;
    this.setNewBackendTokenPromiseR = null;
    this.setNewBackendTokenPromise = null;
    this.waitForNetworkPingsPromise = null;
  }

  public async startConnectionWithBackend() {
    try {
      this.httpAgent = new Agent({
        keepAlive: true,
        keepAliveMsecs: 1000,
        maxSockets: Infinity,
        maxTotalSockets: Infinity,
        maxFreeSockets: 5,
        timeout: 10_000,
        scheduling: 'lifo',
      });

      this.axiosInstance = axios.create({
        baseURL: config.BACKEND_URL,
        httpAgent: this.httpAgent,
      });

      this.axiosInstance.interceptors.request.use(
        (config) => {
          config.headers.Authorization = `Bearer ${this.backendToken}`;

          return config;
        },
        (error) => {
          logger.error(
            `Request error:\n${error}\n${error instanceof Error ? error.stack : ''}`,
          );

          return Promise.reject(error);
        },
      );

      this.axiosInstance.interceptors.response.use(null, (error) => {
        if (this.isTokenError(error) && error.config) {
          return this.setNewBackendToken().then(() =>
            this.axiosInstance!.request(error.config!),
          );
        }

        if (
          (this.isNetworkError(error) ||
            this.isServerUnavailableError(error)) &&
          error.config
        ) {
          return this.waitForNetwork().then(() =>
            this.axiosInstance!.request(error.config!),
          );
        }

        logger.error(
          `Response error:\n${error}\n${error instanceof Error ? error.stack : ''}`,
        );

        return Promise.reject(error);
      });

      await axios.get('/api/ping', {
        baseURL: config.BACKEND_URL,
        httpAgent: this.httpAgent,
      });

      logger.info('Start connection with backend');
    } catch (error) {
      logger.error(
        `Failed to start connection with backend:\n${error}\n${error instanceof Error ? error.stack : ''}`,
      );

      throw error;
    }
  }

  public getAxiosInstance() {
    if (!this.axiosInstance) {
      logger.error(`Connection with backend is not established`);

      throw new StatusError('Something went wrong.', 500);
    }

    return this.axiosInstance;
  }

  public destroyHTTPAgent(): void {
    this.httpAgent?.destroy();
  }

  private async setNewBackendToken(): Promise<void> {
    if (this.setNewBackendTokenPromise !== null) {
      await this.setNewBackendTokenPromise;

      return;
    }

    try {
      if (
        this.lastSuccessCallOFSetNewBackendTokenPromise &&
        new Date().getHours() -
          this.lastSuccessCallOFSetNewBackendTokenPromise.getHours() <=
          1
      ) {
        throw new Error(
          `Token refresh function call is made too often. Last call time: ${this.lastSuccessCallOFSetNewBackendTokenPromise.toUTCString()}. Current time: ${new Date().toUTCString()}`,
        );
      }

      this.setNewBackendTokenPromise = new Promise<void>((r) => {
        this.setNewBackendTokenPromiseR = r;
      });

      const { token: newBackendToken } = await axios
        .post<{ token: string }>(
          '/api/microservices/issue-access-token',
          undefined,
          {
            baseURL: config.BACKEND_URL,
            httpAgent: this.httpAgent,
            headers: { Authorization: `Bearer ${getMicroserviceAuthToken()}` },
            validateStatus(status) {
              return status === 200 || status === 201;
            },
          },
        )
        .then((response) => response.data);

      this.lastSuccessCallOFSetNewBackendTokenPromise = new Date();

      this.backendToken = newBackendToken;
    } catch (error) {
      logger.error(
        `${error instanceof Error && error.stack ? error.stack : error}`,
      );

      throw new StatusError('Something went wrong.', 500);
    } finally {
      if (this.setNewBackendTokenPromiseR) {
        this.setNewBackendTokenPromiseR();
      }

      this.setNewBackendTokenPromise = null;
    }
  }

  private async waitForNetwork() {
    if (this.waitForNetworkPingsPromise) {
      return this.waitForNetworkPingsPromise;
    }

    const promise = (async () => {
      let timeout = 10_000;

      // eslint-disable-next-line no-constant-condition
      while (true) {
        try {
          await axios.get('/api/ping', { baseURL: config.BACKEND_URL });

          break;
        } catch (error) {
          logger.error('Network error in ping', {
            error,
            currentTime: new Date(),
            timeoutBeforeNextPing: timeout,
          });

          await new Promise<void>((r) => setTimeout(() => r(), timeout));

          timeout = timeout <= 5 * 60_000 ? timeout * 2 : timeout;
        }
      }
    })();

    this.waitForNetworkPingsPromise = promise.finally(() => {
      this.waitForNetworkPingsPromise = null;
    });

    return this.waitForNetworkPingsPromise;
  }

  private isTokenError(error: unknown) {
    return axios.isAxiosError(error) && error.response?.status === 401;
  }

  private isNetworkError(error: unknown) {
    return axios.isAxiosError(error) && error.message === 'Network Error';
  }

  private isServerUnavailableError(error: unknown) {
    return axios.isAxiosError(error) && error.response?.status === 503;
  }

  private backendToken: string;
  private httpAgent: Agent | null;
  private axiosInstance: AxiosInstance | null;
  private lastSuccessCallOFSetNewBackendTokenPromise: Date | null;
  private setNewBackendTokenPromiseR: (() => void) | null;
  private setNewBackendTokenPromise: Promise<void> | null;
  private waitForNetworkPingsPromise: Promise<void> | null;
}

export const backend = new Backend();
