import { INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { UsersModule } from '../../users.module'
import { UserRepository } from '@/users/domain/repositories/user.repository'
import { PrismaClient } from '@prisma/client'
import { setupPrismaTests } from '@/shared/infraestructure/database/prisma/testing/setup-prisma-tests'
import { EnvConfigModule } from '@/shared/infraestructure/env-config/env-config.module'
import { DatabaseModule } from '@/shared/infraestructure/database/database.module'
import request from 'supertest'
import { UsersController } from '../../users.controller'
import { instanceToPlain } from 'class-transformer'
import { applyGlobalConfig } from '@/global-config'
import { UserEntity } from '@/users/domain/entities/user.entity'
import { UserDataBuilder } from '@/users/domain/testing/helpers/user-data-builder'
import { UpdateUserDto } from '../../dto/update-user.dto'

describe('UsersController e2e tests', () => {
  let app: INestApplication
  let module: TestingModule
  let repository: UserRepository
  let updateUserDto: UpdateUserDto
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
    updateUserDto = {
      name: 'test name',
    }

    await prismaService.user.deleteMany()
    entity = new UserEntity(UserDataBuilder({}))
    await repository.insert(entity)
  })

  describe('PUT /users/:id', () => {
    it('should update a user', async () => {
      const res = await request(app.getHttpServer())
        .put(`/users/${entity.id}`)
        .send(updateUserDto)
        .expect(200)

      const user = await repository.findById(entity.id)
      const presenter = UsersController.userToResponse(user.toJSON())
      const serialized = instanceToPlain(presenter)

      expect(res.body.data).toStrictEqual(serialized)
    })

    it('should return error with 422 code when the request body is invalid', async () => {
      const res = await request(app.getHttpServer())
        .put(`/users/${entity.id}`)
        .send({})
        .expect(422)

      expect(res.body.error).toBe('Unprocessable Entity')
      expect(res.body.message).toEqual([
        'name should not be empty',
        'name must be a string',
      ])
    })

    it('should return error with 404 code when throw NotFoundError with invalid id', async () => {
      const res = await request(app.getHttpServer())
        .put('/users/fakeid')
        .send(updateUserDto)
        .expect(404)
        .expect({
          statusCode: 404,
          error: 'Not Found',
          message: 'UserModel not found using ID fakeid',
        })
    })
  })
})
