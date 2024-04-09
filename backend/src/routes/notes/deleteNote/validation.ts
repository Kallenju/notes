import { celebrate, Joi, Segments } from 'celebrate';

export const validation = celebrate({
  [Segments.QUERY]: Joi.object({
    noteId: Joi.string().optional(),
    hidden: Joi.string().valid('true', 'false').optional(),
  }).min(1),
});
