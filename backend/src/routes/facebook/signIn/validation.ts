import { celebrate, Joi, Segments } from 'celebrate';

export const validation = celebrate({
  [Segments.BODY]: Joi.object({
    facebookUserId: Joi.string().required(),
    facebookAccessToken: Joi.string().required(),
  }),
});
