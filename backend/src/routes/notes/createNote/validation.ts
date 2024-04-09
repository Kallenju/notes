import { celebrate, Joi, Segments } from 'celebrate';

export const validation = celebrate({
  [Segments.BODY]: Joi.alternatives().try(
      Joi.object().keys({
        title: Joi.string().allow(''),
        text: Joi.string()
      }),
      Joi.object().keys({
        title: Joi.string(),
        text: Joi.string().allow('')
      }),
    )
});
