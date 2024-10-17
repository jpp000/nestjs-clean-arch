import { BadRequestError } from '@/shared/application/errors/bad-request-error'
import { Controller, Get, INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { BadRequestErrorFilter } from '../../bad-request-error.filter'
import request from 'supertest'

@Controller('stub')
class StubController {
  @Get()
  index() {
    throw new BadRequestError('Input data not provided')
  }
}

describe('BadRequestErrorFilter (e2e)', () => {
  let app: INestApplication
  let module: TestingModule

  beforeAll(async () => {
    module = await Test.createTestingModule({
      controllers: [StubController],
    }).compile()
    app = module.createNestApplication()
    app.useGlobalFilters(new BadRequestErrorFilter())

    await app.init()
  })

  afterAll(async () => {
    await module.close()
  })

  it('should be defined', () => {
    expect(new BadRequestErrorFilter()).toBeDefined()
  })

  it('should catch BadRequestError', async () => {
    await request(app.getHttpServer()).get('/stub').expect(400).expect({
      statusCode: 400,
      error: 'Bad Request Error',
      message: 'Input data not provided',
    })
  })
})
