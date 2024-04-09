import { Router } from 'express';

import { issueMicroserviceTokenRouter } from './issueMicroserviceToken.js';

const microservicesRouter = Router();

microservicesRouter.use('/microservices', issueMicroserviceTokenRouter);

export { microservicesRouter };
