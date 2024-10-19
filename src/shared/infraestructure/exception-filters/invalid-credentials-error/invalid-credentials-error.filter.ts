import { InvalidCredentialsError } from '@/shared/application/errors/invalid-credentials-error copy'
import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common'
import { FastifyReply } from 'fastify'

@Catch(InvalidCredentialsError)
export class InvalidCredentialsErrorFilter implements ExceptionFilter {
  catch(exception: InvalidCredentialsError, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const res = ctx.getResponse<FastifyReply>()

    return res.status(400).send({
      statusCode: 400,
      error: 'Invalid Credentials Error',
      message: exception.message,
    })
  }
}
