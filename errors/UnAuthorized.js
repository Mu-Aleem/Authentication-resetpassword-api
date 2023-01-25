import CustomApiError from "./CustomApiError.js";
import { StatusCodes } from "http-status-codes";

class UnAuthorizedError extends CustomApiError {
  constructor(message) {
    super(message);
    this.statusCodes = StatusCodes.UNAUTHORIZED;
  }
}
export default UnAuthorizedError;
