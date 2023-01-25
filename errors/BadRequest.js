import CustomApiError from "./CustomApiError.js";
import { StatusCodes } from "http-status-codes";
class BadRequest extends CustomApiError {
  constructor(message) {
    super(message);
    this.statusCodes = StatusCodes.BAD_REQUEST;
  }
}

export default BadRequest;
