import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db";
import cors from "cors";
import colors from "colors";
import path from "path";
import morgan from "morgan";
import logger from "./logging/logger";
import { errorHandler, notFound } from "./middlewares/errorMiddlewares";
import { errorLogger, requestLogger } from "./middlewares/loggerMiddlewares";
import userRoutes from "./routes/userRoutes";
import clientRoutes from "./routes/clientRoutes";
import measurementRoutes from "./routes/measurementRoutes";
import cookieParser from "cookie-parser";
import subscriptionRoutes from "./routes/subsciptionRoutes";
import planRoutes from "./routes/planRoutes";
try {
  dotenv.config({ debug: true });
  colors.enable();
  connectDB();

  const app = express();
  const PORT = process.env.PORT;
  const dirname = path.resolve();

  app.use(
    cors({
      origin: [
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
      ],
      allowedHeaders: ["Content-Type", "X-Client-Id"],
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    })
  );
  app.use(express.json({ limit: "200kb" }));
  app.use(morgan("short"));
  app.use(requestLogger);
  app.use(cookieParser());

  app.use("/api/users", userRoutes);
  app.use("/api/measurements", measurementRoutes);
  app.use("/api/clients", clientRoutes);
  app.use("/api/subscription", subscriptionRoutes);
  app.use("/api/plans", planRoutes);

  app.use(express.static(path.join(dirname, "/frontend/dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(dirname, "frontend", "dist", "index.html"));
  });

  // if (process.env.NODE_ENV === "production") {
  //   console.log("in prod mode");
  //   app.use(express.static(path.join(dirname, "/frontend/dist")));
  //   app.get("*", (req, res) => {
  //     res.sendFile(path.resolve(dirname, "frontend", "dist", "index.html"));
  //   });
  // } else {
  //   app.get("/", (req, res) => {
  //     res.send("Api is running....");
  //   });
  // }

  // setupSwagger(app);
  app.use(notFound);
  app.use(errorLogger);
  app.use(errorHandler);

  app.listen(PORT, () => {
    const url = `http://localhost:${PORT}`;
    console.log(`Server Started Running at ${url}`.yellow);
    logger.info(`Server Started Running at ${url}`.yellow);
  });

  process.on("uncaughtException", (err) => {
    console.log("uncaught exception: ", err);
  });
} catch (e) {
  console.error(e);
}
