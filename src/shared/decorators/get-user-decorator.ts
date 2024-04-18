import {
  createParamDecorator,
  ExecutionContext,
  PipeTransform,
  Type,
} from '@nestjs/common';

export const GetUser: (
  ...dataOrPipes: (
    | string
    | PipeTransform<any, any>
    | Type<PipeTransform<any, any>>
  )[]
) => ParameterDecorator = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request: Express.Request = ctx.switchToHttp().getRequest();
    if (data) {
      return request.user[data];
    }
    return request.user;
  },
);
