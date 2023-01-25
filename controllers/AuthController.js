import AuthModel from "../models/Auth.js";
import { StatusCodes } from "http-status-codes";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import transporter from "../config/EmailConfig.js";

import {
  BadApiRequestError,
  UnAuthorizedError,
  NotFoundError,
} from "../errors/index.js";

const RegisterUser = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    throw new BadApiRequestError("please provide all required fields");
  }
  if (password.length < 6) {
    throw new BadApiRequestError("password must be between  6 characters");
  }
  const userAlreadyExists = await AuthModel.findOne({ email });
  if (userAlreadyExists) {
    throw new BadApiRequestError("Email already in use");
  }
  const user = await AuthModel.create({ name, email, password });
  user.password = undefined;
  const Token = user.createJWT();
  res.status(StatusCodes.OK).json({ success: true, error: false, user, Token });
};

const LoginUser = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new BadApiRequestError("please provide all required fields");
  }
  const user = await AuthModel.findOne({ email });
  if (!user) {
    throw new UnAuthorizedError("invalid credentials");
  }
  const isCorrectPassword = await user.comparePassword(password);

  if (!isCorrectPassword) {
    throw new UnAuthorizedError("invalid credentials");
  }
  const Token = user.createJWT();
  user.password = undefined;
  user.__v = undefined;
  res.status(StatusCodes.OK).json({
    success: true,
    error: false,
    user,
    Token,
  });
};

const UserInfo = async (req, res) => {
  const user = await AuthModel.findById(req.user.userId);
  if (!user) {
    throw new NotFoundError("User Not Found ");
  }
  user.password = undefined;
  user.__v = undefined;
  res.status(StatusCodes.OK).json({
    success: true,
    error: false,
    user,
  });
};

const ChangePassword = async (req, res) => {
  const { password, password_confirmation, OldPassword } = req.body;

  if (!OldPassword || !password || !password_confirmation) {
    throw new BadApiRequestError("please provide all required fields");
  }
  const user = await AuthModel.findById(req.user.userId);
  if (!user) {
    throw new NotFoundError("User Not Found ");
  }

  const isCorrectPassword = await user.comparePassword(OldPassword);

  if (!isCorrectPassword) {
    throw new UnAuthorizedError("Your Old password is incorrect");
  }
  if (password !== password_confirmation) {
    throw new BadApiRequestError(
      "New Password and Confirm New Password doesn't match"
    );
  }
  if (password.length < 6) {
    throw new BadApiRequestError("password must be between  6 characters");
  }

  const salt = await bcrypt.genSalt(10);
  const newHashPassword = await bcrypt.hash(password, salt);

  await AuthModel.findByIdAndUpdate(req.user.userId, {
    $set: { password: newHashPassword },
  });
  res.status(StatusCodes.OK).json({
    status: "success",
    message: "Password changed succesfully",
  });
};

// Send the reset Email link

const UserResetPasswordEmail = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    throw new BadApiRequestError("please provide The Email");
  }
  const user = await AuthModel.findOne({ email: email });
  if (!user) {
    throw new NotFoundError("User Not Found ");
  }

  // create the secret link

  const secret = user._id + process.env.JWT_SECRET;
  const token = jwt.sign({ userID: user._id }, secret, {
    expiresIn: "15m",
  });

  const link = `http://127.0.0.1:3000/api/user/reset/${user._id}/${token}`;
  // Send Email
  const info = await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: user.email,
    subject: "Password Reset Link",
    html: `<a href=${link}>Click Here</a> to Reset Your Password`,
  });
  res.status(StatusCodes.OK).json({
    status: "success",
    message: "Password Reset Email Sent... Please Check Your Email",
  });
};

const ResetPassword = async (req, res) => {
  const { password, password_confirmation } = req.body;
  const { id, token } = req.params;

  if (!password || !password_confirmation) {
    throw new BadApiRequestError("please provide all required fields");
  }
  if (password !== password_confirmation) {
    throw new BadApiRequestError(
      "New Password and Confirm New Password doesn't match"
    );
  }
  if (password.length < 6) {
    throw new BadApiRequestError("password must be between  6 characters");
  }
  const user = await AuthModel.findById(id);
  if (!user) {
    throw new NotFoundError("User Not Found");
  }

  // verify the token
  const new_secret = user._id + process.env.JWT_SECRET;
  jwt.verify(token, new_secret);

  const salt = await bcrypt.genSalt(10);
  const newHashPassword = await bcrypt.hash(password, salt);
  await AuthModel.findByIdAndUpdate(user._id, {
    $set: { password: newHashPassword },
  });
  res.status(StatusCodes.OK).json({
    status: "success",
    message: "Password Reset Successfully",
  });
};

export {
  RegisterUser,
  LoginUser,
  ChangePassword,
  UserInfo,
  UserResetPasswordEmail,
  ResetPassword,
};
