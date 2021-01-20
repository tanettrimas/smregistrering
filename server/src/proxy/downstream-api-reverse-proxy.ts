import { getOnBehalfOfAccessToken } from '../auth/azureUtils';
import { Config } from '../config';
import proxy, { ProxyOptions } from 'express-http-proxy';
import url from 'url';
import { Router, Request, Response } from 'express';
import { RequestOptions } from 'http';
import { Client } from 'openid-client';
import { ApiReverseProxy } from '../types/Config';
import logger from '../logging';

const options = (api: ApiReverseProxy, authClient: Client): ProxyOptions => ({
  parseReqBody: true,
  proxyReqOptDecorator: (proxyReqOpts: RequestOptions, req: Request) => {
    return new Promise<RequestOptions>((resolve, reject) =>
      getOnBehalfOfAccessToken(authClient, req, api, 'proxy')
        .then(
          (access_token) => {
            if (proxyReqOpts && proxyReqOpts.headers) {
              logger.info(`Setting access_token as Authorization header for request to ${req.originalUrl}`);
              proxyReqOpts.headers['Authorization'] = `Bearer ${access_token}`;
              return resolve(proxyReqOpts);
            } else {
              throw new Error('Could not set Authorization header for downstream api proxy request');
            }
          },
          (error) => {
            logger.error(`Could not get access token for request to ${req.originalUrl}`);
            reject(error);
          },
        )
        .catch((error) => {
          logger.error(error.message);
          reject(error);
        }),
    );
  },
  proxyReqPathResolver: (req: Request) => {
    const urlFromApi = url.parse(api.url);
    const pathFromApi = urlFromApi.pathname === '/' ? '' : urlFromApi.pathname;

    const urlFromRequest = url.parse(req.originalUrl);

    let pathFromRequest;
    if (urlFromRequest.pathname) {
      pathFromRequest = urlFromRequest.pathname.replace(`/${api.path}/`, '/');
    } else {
      logger.error('Error replacing downstream proxy prefix to "/"');
    }

    const queryString = urlFromRequest.query;
    const newPath =
      (pathFromApi ? pathFromApi : '') +
      (pathFromRequest ? pathFromRequest : '') +
      (queryString ? '?' + queryString : '');

    logger.info(`Proxying request from ${req.originalUrl} to ${newPath}`);
    return newPath;
  },
  userResDecorator: (proxyRes: Response, proxyResData: any, userReq: Request, _userRes: Response) => {
    logger.info(
      `Received response with statuscode: ${proxyRes.statusCode} from proxied request to ${userReq.method} ${userReq.originalUrl}`,
    );
    return proxyResData;
  },
});

const setup = (router: Router, authClient: Client, config: Config) => {
  const { path, url } = config.downstreamApiReverseProxy;
  logger.info(`Setting up proxy for '${path}'`);
  router.use(`/${path}/*`, proxy(url, options(config.downstreamApiReverseProxy, authClient)));
};

export default { setup };
