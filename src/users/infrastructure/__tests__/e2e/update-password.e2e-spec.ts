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
import { UpdatePasswordDto } from '../../dto/update-password.dto'
import { HashProvider } from '@/shared/application/providers/hash-provider'
import { BcryptHashProvider } from '../../providers/hash-provider/bcrypt-hash.provider'

describe('UsersController e2e tests', () => {
  let app: INestApplication
  let module: TestingModule
  let repository: UserRepository
  let hashProvider: HashProvider
  let updatePasswordDto: UpdatePasswordDto
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
    hashProvider = new BcryptHashProvider()
  })

  beforeEach(async () => {
    updatePasswordDto = {
      oldPassword: '1234',
      password: 'new pass',
    }

    await prismaService.user.deleteMany()
    const hashPassword = await hashProvider.generateHash('1234')
    entity = new UserEntity(UserDataBuilder({ password: hashPassword }))
    await repository.insert(entity)
  })

  describe('PATCH /users/:id', () => {
    it('should update users password', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/users/${entity.id}`)
        .send(updatePasswordDto)
        .expect(200)

      const user = await repository.findById(res.body.data.id)
      const presenter = UsersController.userToResponse(user.toJSON())
      const serialized = instanceToPlain(presenter)

      const checkNewPassword = await hashProvider.compareHash(
        'new pass',
        user.password,
      )

      expect(res.body.data).toStrictEqual(serialized)
      expect(checkNewPassword).toBeTruthy()
    })

    it('should return error with 422 code when the request body is invalid', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/users/${entity.id}`)
        .send({})
        .expect(422)

      expect(res.body.error).toBe('Unprocessable Entity')
      expect(res.body.message).toEqual([
        'password should not be empty',
        'password must be a string',
        'oldPassword should not be empty',
        'oldPassword must be a string',
      ])
    })

    it('should return error with 404 code when throw NotFoundError with invalid id', async () => {
      const res = await request(app.getHttpServer())
        .patch('/users/fakeid')
        .send(updatePasswordDto)
        .expect(404)
        .expect({
          statusCode: 404,
          error: 'Not Found',
          message: 'UserModel not found using ID fakeid',
        })
    })

    it('should return error with 422 code when the password field is invalid', async () => {
      delete updatePasswordDto.password
      const res = await request(app.getHttpServer())
        .patch(`/users/${entity.id}`)
        .send(updatePasswordDto)
        .expect(422)

      expect(res.body.error).toBe('Unprocessable Entity')
      expect(res.body.message).toEqual([
        'password should not be empty',
        'password must be a string',
      ])
    })

    it('should return error with 422 code when the oldPassword field is invalid', async () => {
      updatePasswordDto.oldPassword = 'wrong pass'
      const res = await request(app.getHttpServer())
        .patch(`/users/${entity.id}`)
        .send(updatePasswordDto)
        .expect(422)
        .expect({
          statusCode: 422,
          error: 'Invalid Password Error',
          message: 'Old password does not match',
        })
    })
  })
})
