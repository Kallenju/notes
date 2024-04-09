import { celebrate, Joi, Segments } from 'celebrate';

export const validation = celebrate({
  [Segments.QUERY]: Joi.object({
    start: Joi.number().prefs({ convert: true }).required(),
    end: Joi.number().prefs({ convert: true }).optional(),
    titleQuery: Joi.string().optional(),
    dates: Joi.string().valid('1 month', '3 month').optional(),
    hidden: Joi.string().valid('true', 'false').optional(),
  }),
});
