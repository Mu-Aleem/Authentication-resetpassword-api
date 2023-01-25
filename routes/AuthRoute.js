import express from "express";
const routes = express.Router();
import {
  RegisterUser,
  LoginUser,
  UserInfo,
  ChangePassword,
  UserResetPasswordEmail,
  ResetPassword,
} from "../controllers/AuthController.js";
import AuthMiddleware from "../middlewares/Auth.js";

routes.post("/register", RegisterUser);
routes.post("/login", LoginUser);
routes.get("/userInfo", AuthMiddleware, UserInfo);
routes.post("/changepassword", AuthMiddleware, ChangePassword);
routes.post("/send-reset-password-email", UserResetPasswordEmail);
routes.post("/reset-password/:id/:token", ResetPassword);

export default routes;
