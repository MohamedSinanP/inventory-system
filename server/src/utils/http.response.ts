export class HttpResponse {
  static success<T>(
    data: T,
    message: string = "Success",
    statusCode: number = 200
  ) {
    return {
      success: true,
      statusCode,
      message,
      data,
    };
  };

  static created<T>(data: T, message: string = "Resource created successfully") {
    return {
      success: true,
      statusCode: 201,
      message,
      data,
    };
  };

  static error(message: string, statusCode: number = 500, errors?: any) {
    return {
      success: false,
      statusCode,
      message,
      errors,
    };
  };

  static badRequest(message: string, errors?: any) {
    return this.error(message, 400, errors);
  };

  static unauthorized(message: string = "Unauthorized access") {
    return this.error(message, 401);
  };

  static forbidden(message: string = "Forbidden access") {
    return this.error(message, 403);
  };

  static notFound(message: string = "Resource not found") {
    return this.error(message, 404);
  };

  static serverError(message: string = "Internal Server Error") {
    return this.error(message, 500);
  };
};