import { Controller, Get, INestApplication } from '@nestjs/common'
import { InvalidCredentialsErrorFilter } from '../../invalid-credentials-error.filter'
import { Test, TestingModule } from '@nestjs/testing'
import { InvalidCredentialsError } from '@/shared/application/errors/invalid-credentials-error copy'
import request from 'supertest'

@Controller('stub')
class StubController {
  @Get()
  index() {
    throw new InvalidCredentialsError('Invalid credentials')
  }
}

describe('InvalidCredentialsErrorFilter (e2e)', () => {
  let app: INestApplication
  let module: TestingModule

  beforeAll(async () => {
    module = await Test.createTestingModule({
      controllers: [StubController],
    }).compile()

    app = module.createNestApplication()
    app.useGlobalFilters(new InvalidCredentialsErrorFilter())
    await app.init()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should be defined', () => {
    expect(new InvalidCredentialsErrorFilter()).toBeDefined()
  })

  it('should catch InvalidCredentialsError', async () => {
    const res = await request(app.getHttpServer())
      .get('/stub')
      .expect(400)
      .expect({
        statusCode: 400,
        error: 'Invalid Credentials Error',
        message: 'Invalid credentials',
      })
  })
})
