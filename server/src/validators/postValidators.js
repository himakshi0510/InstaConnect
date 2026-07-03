const { body } = require('express-validator');
const { validationResult } = require('express-validator');
const { errorResponse } = require('../utils/apiResponse');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return errorResponse(res, 'Validation Error', 400, errors.array());
  }
  next();
};

const postValidator = [
  body('caption')
    .optional()
    .isLength({ max: 2200 }).withMessage('Caption cannot exceed 2200 characters'),
  validate
];

module.exports = {
  postValidator
};
