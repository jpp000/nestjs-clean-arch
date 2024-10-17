import { INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { UsersModule } from '../../users.module'
import { UserRepository } from '@/users/domain/repositories/user.repository'
import { PrismaClient } from '@prisma/client'
import { setupPrismaTests } from '@/shared/infraestructure/database/prisma/testing/setup-prisma-tests'
import { EnvConfigModule } from '@/shared/infraestructure/env-config/env-config.module'
import { DatabaseModule } from '@/shared/infraestructure/database/database.module'
import request from 'supertest'
import { applyGlobalConfig } from '@/global-config'
import { UserEntity } from '@/users/domain/entities/user.entity'
import { UserDataBuilder } from '@/users/domain/testing/helpers/user-data-builder'

describe('UsersController e2e tests', () => {
  let app: INestApplication
  let module: TestingModule
  let repository: UserRepository
  let entity: UserEntity
  const prismaService = new PrismaClient()

  beforeAll(async () => {
    setupPrismaTests()

    module = await Test.createTestingModule({
      imports: [
        UsersModule,
        EnvConfigModule,
        DatabaseModule.forTest(prismaService),
      ],
    }).compile()

    app = module.createNestApplication()
    applyGlobalConfig(app)
    await app.init()

    repository = module.get<UserRepository>('UserRepository')
  })

  beforeEach(async () => {
    await prismaService.user.deleteMany()
    entity = new UserEntity(UserDataBuilder({}))
    await repository.insert(entity)
  })

  describe('DELETE /users/:id', () => {
    it('should remove a user', async () => {
      const res = await request(app.getHttpServer())
        .delete(`/users/${entity.id}`)
        .expect(204)
        .expect({})
    })

    it('should return error with 404 code when throw NotFoundError with invalid id', async () => {
      const res = await request(app.getHttpServer())
        .get('/users/fakeid')
        .expect(404)
        .expect({
          statusCode: 404,
          error: 'Not Found',
          message: 'UserModel not found using ID fakeid',
        })
    })
  })
})
