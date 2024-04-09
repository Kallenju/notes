import { celebrate, Joi, Segments } from 'celebrate';

export const validation = celebrate({
  [Segments.BODY]: Joi.object({
    unparsedAccessTokenCookie: Joi.string().required(),
  }),
});
