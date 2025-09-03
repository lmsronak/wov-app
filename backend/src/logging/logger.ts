import fs from "fs";
import path from "path";
import winston, { format, transports } from "winston";
import DailyRotateFile from "winston-daily-rotate-file";

const isDevelopment = process.env.NODE_ENV !== "production";

function ensureDirExists(targetPath: string): void {
  const isFile = path.extname(targetPath) !== "";

  const dirPath = isFile ? path.dirname(targetPath) : targetPath;

  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

const getFileName = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  ensureDirExists(`backend/logs/${year}/${month}`);

  return "./backend/logs/%DATE%.log";
};

const transport = new DailyRotateFile({
  filename: getFileName(),
  dirname: path.join("./backend", "logs"),
  datePattern: "YYYY/MM/DD",
  level: "verbose",
  zippedArchive: false,
  maxSize: "20m",
  maxFiles: "14d",
  createSymlink: false,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(
      (info) =>
        `${info.timestamp} [${info.level.toUpperCase()}]: ${info.message}`
    )
  ),
});

transport.on("new", (newFilename: string) => {
  logger.info("making new log");
  try {
    ensureDirExists(newFilename);
  } catch (e) {
    console.error(e);
  }
});

transport.on("rotate", (oldFileName, newFileName) => {
  logger.info("rotating log files: ", oldFileName, newFileName);
});

transport.on("error", (err) => {
  logger.info("[winston]: ", err);
});

const logger = winston.createLogger({
  level: "info",
  levels: winston.config.npm.levels,
  transports: [transport],
  exceptionHandlers: [transport],
  rejectionHandlers: [transport],
});

if (isDevelopment) {
  logger.add(
    new transports.Console({
      level: "info",
      format: format.combine(format.colorize(), format.simple()),
    })
  );
}

logger.on("error", (err) => {
  console.log("[logger]: ", err);
});

export default logger;
