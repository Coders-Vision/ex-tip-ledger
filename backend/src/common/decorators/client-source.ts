import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { IncomingMessage } from 'http';

export const GetClientSource = createParamDecorator(
  (_: never, ctx: ExecutionContext): string => {
    const req = ctx.switchToHttp().getRequest<IncomingMessage>();
    const client = req.headers['x-client'] as string;
    return client;
  },
);
