import { celebrate, Joi, Segments } from 'celebrate';

export const validation = celebrate({
  [Segments.PARAMS]: Joi.object({
    noteId: Joi.string().required()
  })
});
