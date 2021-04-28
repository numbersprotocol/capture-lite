export abstract class BaseError extends Error {
  abstract readonly name: string;

  constructor(source?: unknown) {
    let message: string | undefined;
    if (typeof source === 'string') super(message);
    else if (source instanceof Error) super(source.message);
    else super(JSON.stringify(source));
  }
}

export class NotImplementedError extends BaseError {
  readonly name = 'NotImplementedError';
}
