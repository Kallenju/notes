import { celebrate, Joi, Segments } from 'celebrate';

export const validation = celebrate({
  [Segments.BODY]: Joi.alternatives().try(
    Joi.object({
      id: Joi.string().required(),
      title: Joi.string().allow(''),
      text: Joi.string(),
      hidden: Joi.boolean().optional(),
    }),
    Joi.object({
      id: Joi.string().required(),
      title: Joi.string(),
      text: Joi.string().allow(''),
      hidden: Joi.boolean().optional(),
    }),
  )
});
