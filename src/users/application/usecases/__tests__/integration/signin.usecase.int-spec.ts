import { PrismaClient } from '@prisma/client'
import { SigninUseCase } from '../../signin.usecase'
import { UserPrismaRepository } from '@/users/infrastructure/database/prisma/repositories/user-prisma.repository'
import { Test, TestingModule } from '@nestjs/testing'
import { HashProvider } from '@/shared/application/providers/hash-provider'
import { setupPrismaTests } from '@/shared/infraestructure/database/prisma/testing/setup-prisma-tests'
import { DatabaseModule } from '@/shared/infraestructure/database/database.module'
import { BcryptHashProvider } from '@/users/infrastructure/providers/hash-provider/bcrypt-hash.provider'
import { UserEntity } from '@/users/domain/entities/user.entity'
import { UserDataBuilder } from '@/users/domain/testing/helpers/user-data-builder'
import { NotFoundError } from '@/shared/domain/errors/not-found-error'
import { InvalidCredentialsError } from '@/shared/application/errors/invalid-credentials-error copy'
import { BadRequestError } from '@/shared/application/errors/bad-request-error'

describe('SigninUseCase integration tests', () => {
  const prismaService = new PrismaClient()
  let sut: SigninUseCase.UseCase
  let repository: UserPrismaRepository
  let module: TestingModule
  let hashProvider: HashProvider
  beforeAll(async () => {
    setupPrismaTests()
    module = await Test.createTestingModule({
      imports: [DatabaseModule.forTest(prismaService)],
    }).compile()
    repository = new UserPrismaRepository(prismaService as any)
    hashProvider = new BcryptHashProvider()
  })
  beforeEach(async () => {
    sut = new SigninUseCase.UseCase(repository, hashProvider)
    await prismaService.user.deleteMany()
  })
  afterAll(async () => {
    await module.close()
  })
  it('should not be able to authenticate with wrong email', async () => {
    const entity = new UserEntity(UserDataBuilder({}))
    await expect(() =>
      sut.execute({
        email: entity.email,
        password: '1234',
      }),
    ).rejects.toBeInstanceOf(NotFoundError)
  })
  it('should not be able to authenticate with wrong password', async () => {
    const hashPassword = await hashProvider.generateHash('1234')
    const entity = new UserEntity(
      UserDataBuilder({
        email: 'a@a.com',
        password: hashPassword,
      }),
    )
    await prismaService.user.create({
      data: entity.toJSON(),
    })

    const spyCompareHash = jest.spyOn(hashProvider, 'compareHash')

    await expect(() =>
      sut.execute({
        email: 'a@a.com',
        password: 'fake',
      }),
    ).rejects.toBeInstanceOf(InvalidCredentialsError)
    expect(spyCompareHash).toHaveBeenCalledTimes(1)
  })
  it('should throws error when email not provided', async () => {
    await expect(() =>
      sut.execute({
        email: null,
        password: '1234',
      }),
    ).rejects.toBeInstanceOf(BadRequestError)
  })
  it('should throws error when password not provided', async () => {
    await expect(() =>
      sut.execute({
        email: 'a@a.com',
        password: null,
      }),
    ).rejects.toBeInstanceOf(BadRequestError)
  })
  it('should authenticate a user', async () => {
    const hashPassword = await hashProvider.generateHash('1234')
    const entity = new UserEntity(
      UserDataBuilder({ email: 'a@a.com', password: hashPassword }),
    )
    const newUser = await prismaService.user.create({
      data: entity.toJSON(),
    })
    const output = await sut.execute({
      email: 'a@a.com',
      password: '1234',
    })
    expect(output).toMatchObject(entity.toJSON())
  })
})
