import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';
import http from 'node:http';
import https from 'node:https';
import type { Request as ExpressRequest, Response as ExpressResponse } from 'express';

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();

const AUTH_SERVICE_URL = process.env['AUTH_SERVICE_URL'] || 'http://localhost:8081';
const ACCOUNT_SERVICE_URL = process.env['ACCOUNT_SERVICE_URL'] || 'http://localhost:8082';
const PAYMENT_SERVICE_URL = process.env['PAYMENT_SERVICE_URL'] || 'http://localhost:8083';

function proxyTo(target: string) {
  return (req: ExpressRequest, res: ExpressResponse) => {
    const url = new URL(target + req.url);
    const transport = url.protocol === 'https:' ? https : http;
    const proxyReq = transport.request(
      url,
      {
        method: req.method,
        headers: { ...req.headers, host: url.host },
      },
      (proxyRes) => {
        res.writeHead(proxyRes.statusCode ?? 500, proxyRes.headers);
        proxyRes.pipe(res);
      },
    );
    proxyReq.on('error', () => {
      res.status(502).json({ message: 'Servicio no disponible' });
    });
    req.pipe(proxyReq);
  };
}

const angularApp = new AngularNodeAppEngine();

app.use('/api/auth', proxyTo(AUTH_SERVICE_URL));
app.use('/api/accounts', proxyTo(ACCOUNT_SERVICE_URL));
app.use('/api/payments', proxyTo(PAYMENT_SERVICE_URL));

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    immutable: true,
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
