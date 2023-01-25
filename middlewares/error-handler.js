import { StatusCodes } from "http-status-codes";

const errorHandlerMiddleware = (err, req, res, next) => {
  console.log(err);
  const defaultError = {
    StatusCodes: err.statusCodes || StatusCodes.INTERNAL_SERVER_ERROR,
    msg: err.message || "Something went wrong , please try again later",
  };

  // this is a database Validation Error

  if (err.name === "ValidationError") {
    defaultError.StatusCodes = StatusCodes.BAD_REQUEST;
    defaultError.msg = Object.values(err.errors)
      .map((item) => item.message)
      .join(",");
  }

  // This is for the already exit in the DB

  if (err.code && err.code === 11000) {
    defaultError.StatusCodes = StatusCodes.BAD_REQUEST;
    defaultError.msg = `${Object.keys(err.keyValue)} filed has to be unique`;
  }

  // res.status(defaultError.StatusCodes).json({ message: err });

  res.status(defaultError.StatusCodes).json({ message: defaultError.msg });

  // res.status(500).json({ msg: err });
};
export default errorHandlerMiddleware;
