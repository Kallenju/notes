import { celebrate, Joi, Segments } from 'celebrate';

export const validation = celebrate({
  [Segments.BODY]: Joi.object({
    csrfToken: Joi.string().required(),
  }),
});
