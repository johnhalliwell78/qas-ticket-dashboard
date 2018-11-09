import * as HttpStatus from "./httpStatus";

export class InputIncorrect extends Error {
  constructor(errorString: string) {
    super(errorString);
  }
}

export class HttpError extends Error {
  status: number;
  title: string;
  constructor(status: number, title: string, message: string) {
    super(message);
    this.status = status;
    this.title = title;
  }
}

export class NotFound extends HttpError {
  constructor(message: string = "The resource you were looking was not found.") {
    super(HttpStatus.NOT_FOUND, "Not Found", message);
  }
}

export class NotAuthorized extends HttpError {
  constructor(message: string = "You are not authorized to view this page") {
    super(HttpStatus.NOT_AUTHORIZED, "Not Authorized", message);
  }
}

export class ServerError extends HttpError {
  constructor(message: string = "Server Error") {
    super(HttpStatus.SERVER_ERROR, "Server Error", message);
  }
}

export class NotAvailable extends HttpError {
  constructor(message: string = "Service is unavailable. Please come back later") {
    super(HttpStatus.NOT_AVAILABLE, "Service Unavailable", message);
  }
}

export class Forbidden extends HttpError {
  constructor(message: string = "Forbidden") {
    super(HttpStatus.FORBIDDEN, "Forbidden", message);
  }
}

export class BadRequest extends HttpError {
  constructor(message: string = "Bad Request") {
    super(HttpStatus.BAD_REQUEST, "Bad Request", message);
  }
}

export class NotAcceptable extends HttpError {
  constructor(message: string = "Not acceptable") {
    super(HttpStatus.NOT_ACCEPTABLE, "Not acceptable", message);
  }
}

export class ResposeErrorCode {
  public static readonly NO_SUCH_RESOURCE: string = "NoSuchResource";
  public static readonly REQUEST_MISSING_DATA: string = "MissingData";
  public static readonly REQUEST_MISSING_FIELD: string = "MissingRequiredField";
  public static readonly NOT_ACCEPTABLE: string = "NotAcceptable";
  public static readonly FORBIDDEN: string = "Forbidden";
  public static readonly PRECONDITION_FAILED: string = "PreconditionFailed";
  public static readonly MISSING_REQUIRED_FIELD: string = "MissingRequiredField";
  public static readonly SERVER_ERROR: string = "ServerError";
  public static readonly CONFLICT: string = "Conflict";
  public static readonly BAD_REQUEST: string = "BadRequest";
  public static readonly NOT_FOUND: string = "NotFound";
}

export class PreconditionFailed extends HttpError {
  constructor(message: string = "Server Error") {
    super(HttpStatus.PRECONDITION_FAILED, "Server Error", message);
  }
}
