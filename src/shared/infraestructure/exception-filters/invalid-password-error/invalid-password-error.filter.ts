import { InvalidPasswordError } from '@/shared/application/errors/invalid-password-error'
import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common'
import { FastifyReply } from 'fastify'

@Catch(InvalidPasswordError)
export class InvalidPasswordErrorFilter implements ExceptionFilter {
  catch(exception: InvalidPasswordError, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const res = ctx.getResponse<FastifyReply>()

    return res.status(422).send({
      statusCode: 422,
      error: 'Invalid Password Error',
      message: exception.message,
    })
  }
}
