const { ValidationError } = require('sequelize');

const ResponseStatus = {
  SUCCESS: 200,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_ERROR: 500,
  UNPROCESSABLE: 422
}

const SuccessResponse = (res, response) => {
  response.msg = "Record fetched successfully";
  response.status = true;
  res.status(ResponseStatus.SUCCESS).send(response);
}

const DeletedResponse = (res, response) => {
  response.msg = "Record deleted successfully";
  response.status = true;
  res.status(ResponseStatus.SUCCESS).send(response);
}

const UpdateResponse = (res, response) => {
  response.msg = "Record updated successfully";
  response.status = true;
  res.status(ResponseStatus.SUCCESS).send(response);
}

const SuccessGetResponse = (res, response) => {
  response.msg = "Record get successfully";
  response.status = true;
  res.status(ResponseStatus.SUCCESS).send(response);
}

const ErrorResponse = (res, err) => {
  let response = {}
  if (err instanceof ValidationError) {
    response.msg = err.errors[0].message
  } else {
    response.msg = err.message;
  }

  response.error = "Internal Error";
  response.status = false;
  res.status(ResponseStatus.INTERNAL_ERROR).send(response);
}

const UnprocessableResponse = (res, data) => {
  data.error = "The client should not repeat this request without modification";
  data.status = false;
  res.status(ResponseStatus.UNPROCESSABLE).send(data);
}

const UnAuthorizedResponse = (res, data) => {
  if (!data) {
    data = {}
  }

  data.error = "Unauthorized";
  data.status = false;
  res.status(ResponseStatus.UNAUTHORIZED).send(data);
}

module.exports = {
  SuccessResponse,
  ErrorResponse,
  UnprocessableResponse,
  UnAuthorizedResponse,
  DeletedResponse,
  UpdateResponse,
  SuccessGetResponse
}