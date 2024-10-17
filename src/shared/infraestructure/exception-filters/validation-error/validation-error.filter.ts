import { ValidationError } from '@/shared/domain/errors/validation-error'
import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common'
import { FastifyReply } from 'fastify'

@Catch(ValidationError)
export class ValidationErrorFilter implements ExceptionFilter {
  catch(exception: ValidationError, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const res = ctx.getResponse<FastifyReply>()

    return res.status(422).send({
      statusCode: 422,
      error: 'Validation Error',
      message: exception.message,
    })
  }
}
