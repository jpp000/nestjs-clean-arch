import { BadRequestError } from '@/shared/application/errors/bad-request-error'
import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common'
import { FastifyReply } from 'fastify'

@Catch()
export class BadRequestErrorFilter<T> implements ExceptionFilter {
  catch(exception: BadRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const res = ctx.getResponse<FastifyReply>()

    return res.status(400).send({
      statusCode: 400,
      error: 'Bad Request Error',
      message: exception.message,
    })
  }
}
