import { ValidationError } from '@/shared/domain/errors/validation-error'
import { Controller, Get, INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import request from 'supertest'
import { ValidationErrorFilter } from '../../validation-error.filter'

@Controller('stub')
class StubController {
  @Get()
  index() {
    throw new ValidationError('Could not convert to a user entity')
  }
}

describe('ValidationErrorFilter (e2e)', () => {
  let app: INestApplication
  let module: TestingModule

  beforeAll(async () => {
    module = await Test.createTestingModule({
      controllers: [StubController],
    }).compile()
    app = module.createNestApplication()
    app.useGlobalFilters(new ValidationErrorFilter())

    await app.init()
  })

  afterAll(async () => {
    await module.close()
  })

  it('should be defined', () => {
    expect(new ValidationErrorFilter()).toBeDefined()
  })

  it('should catch ValidationError', async () => {
    await request(app.getHttpServer()).get('/stub').expect(422).expect({
      statusCode: 422,
      error: 'Validation Error',
      message: 'Could not convert to a user entity',
    })
  })
})
