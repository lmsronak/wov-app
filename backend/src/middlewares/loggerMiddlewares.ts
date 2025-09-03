import { Request, Response, NextFunction } from "express";
import logger from "../logging/logger";

export const getDurationInMilliseconds = (start: any) => {
  const NS_PER_SEC = 1e9;
  const NS_TO_MS = 1e6;
  const diff = process.hrtime(start);

  return (diff[0] * NS_PER_SEC + diff[1]) / NS_TO_MS;
};

let start: any;

export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  start = process.hrtime();
  const { method, httpVersion, headers, originalUrl, query, url } = req;

  res.on("finish", () => {
    const durationInMilliseconds = getDurationInMilliseconds(start);
    const requestLog = {
      req: { headers, httpVersion, method, originalUrl, query, url },
      res: { status: res.statusCode },
      responseTime: durationInMilliseconds,
    };
    logger.log({
      level: "verbose",
      message: `Request Body Info \n ${JSON.stringify(requestLog, null, 1)}`,
    });
  });

  next();
};

export const errorLogger = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { method, httpVersion, headers, originalUrl, query, url, cookies } =
    req;
  const { statusCode } = res;
  req.on("end", () => {
    const durationInMilliseconds = getDurationInMilliseconds(start);
    const errorLog = {
      req: {
        cookies,
        headers,
        httpVersion,
        method,
        originalUrl,
        query,
        url,
        body: req.body,
      },
      res: { status: statusCode },
      responseTime: durationInMilliseconds,
    };
    logger.log({
      level: "error",
      message: err.message + `\n ${JSON.stringify(errorLog, null, 1)}`,
    });
  });

  next(err);
};
