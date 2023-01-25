import dotenv from "dotenv";
dotenv.config();
import express from "express";
import morgan from "morgan";
import cors from "cors";
import "express-async-errors";

import AuthRoute from "./routes/AuthRoute.js";

const app = express();
app.use(express.json());
// CORS Policy
app.use(cors());

// inport the database connection
import connectDB from "./config/connectdb.js";
// middleware
import errorHandlerMiddleware from "./middlewares/error-handler.js";

// this is for the finding the error

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

const DATABASE_URL = process.env.DATABASE_URL;

const port = process.env.PORT;

app.use("/api/v1/auth", AuthRoute);

// Apply the middleware

app.use(errorHandlerMiddleware);

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
  connectDB(DATABASE_URL);
});
