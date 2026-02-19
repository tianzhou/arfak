import type { ConnectRouter } from '@connectrpc/connect';
import { ArfakService } from './gen/arfak/v1/service_connect.js';
import { handlers } from './services/health.js';

export default (router: ConnectRouter) => {
  router.service(ArfakService, handlers);
};
