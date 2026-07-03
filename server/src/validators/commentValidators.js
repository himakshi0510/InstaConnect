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

const commentValidator = [
  body('body')
    .trim()
    .notEmpty().withMessage('Comment body is required')
    .isLength({ min: 1, max: 2200 }).withMessage('Comment must be between 1 and 2200 characters'),
  validate
];

module.exports = {
  commentValidator
};
