export class OneGateError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly gatewayCode: string | number | null,
    message: string,
    public readonly raw?: unknown,
  ) {
    super(message);
    this.name = 'OneGateError';
  }
}
