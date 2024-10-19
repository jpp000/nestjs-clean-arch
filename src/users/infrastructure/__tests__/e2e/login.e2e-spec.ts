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
import { SigninDto } from '../../dto/signin.dto'
import { HashProvider } from '@/shared/application/providers/hash-provider'
import { BcryptHashProvider } from '../../providers/hash-provider/bcrypt-hash.provider'

describe('UsersController e2e tests', () => {
  let app: INestApplication
  let module: TestingModule
  let repository: UserRepository
  let signinDto: SigninDto
  let hashProvider: HashProvider
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
    signinDto = {
      email: 'a@a.com',
      password: '1234',
    }

    await prismaService.user.deleteMany()
  })

  describe('POST /users/login', () => {
    it('should authenticate a user', async () => {
      const hashPassword = await hashProvider.generateHash(signinDto.password)
      const entity = new UserEntity(
        UserDataBuilder({
          email: signinDto.email,
          password: hashPassword,
        }),
      )
      await repository.insert(entity)

      const res = await request(app.getHttpServer())
        .post('/users/login')
        .send(signinDto)
        .expect(200)

      expect(Object.keys(res.body)).toStrictEqual(['accessToken'])
      expect(typeof res.body.accessToken).toBe('string')
    })

    it('should return error with 422 code when the request is invalid', async () => {
      const res = await request(app.getHttpServer())
        .post('/users/login')
        .send({})
        .expect(422)

      expect(res.body.error).toBe('Unprocessable Entity')
      expect(res.body.message).toEqual([
        'email must be an email',
        'email should not be empty',
        'email must be a string',
        'password should not be empty',
        'password must be a string',
      ])
    })

    it('should return error with 422 code when the email field is invalid', async () => {
      delete signinDto.email
      const res = await request(app.getHttpServer())
        .post('/users/login')
        .send(signinDto)
        .expect(422)

      expect(res.body.error).toBe('Unprocessable Entity')
      expect(res.body.message).toEqual([
        'email must be an email',
        'email should not be empty',
        'email must be a string',
      ])
    })

    it('should return error with 422 code when the password field is invalid', async () => {
      delete signinDto.password
      const res = await request(app.getHttpServer())
        .post('/users/login')
        .send(signinDto)
        .expect(422)

      expect(res.body.error).toBe('Unprocessable Entity')
      expect(res.body.message).toEqual([
        'password should not be empty',
        'password must be a string',
      ])
    })

    it('should return error with 404 code when email not found', async () => {
      const res = await request(app.getHttpServer())
        .post('/users/login')
        .send(signinDto)
        .expect(404)

      expect(res.body.error).toBe('Not Found')
      expect(res.body.message).toEqual(
        'UserModel not found using email a@a.com',
      )
    })

    it('should return error with 409 when password is incorrect', async () => {
      const hashPassword = await hashProvider.generateHash(signinDto.password)
      const entity = new UserEntity(
        UserDataBuilder({
          email: signinDto.email,
          password: hashPassword,
        }),
      )
      await repository.insert(entity)

      const res = await request(app.getHttpServer())
        .post('/users/login')
        .send(Object.assign(signinDto, { password: 'wrong pass' }))
        .expect(400)

      console.log(res.body)
    })
  })
})
