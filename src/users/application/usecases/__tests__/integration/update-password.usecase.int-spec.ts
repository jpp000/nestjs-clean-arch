import { PrismaClient } from '@prisma/client'
import { UserPrismaRepository } from '@/users/infrastructure/database/prisma/repositories/user-prisma.repository'
import { Test, TestingModule } from '@nestjs/testing'
import { setupPrismaTests } from '@/shared/infraestructure/database/prisma/testing/setup-prisma-tests'
import { DatabaseModule } from '@/shared/infraestructure/database/database.module'
import { NotFoundError } from '@/shared/domain/errors/not-found-error'
import { UserDataBuilder } from '@/users/domain/testing/helpers/user-data-builder'
import { UserEntity } from '@/users/domain/entities/user.entity'
import { BadRequestError } from '@/shared/application/errors/bad-request-error'
import { UpdatePasswordUseCase } from '../../update-password.usecase'
import { HashProvider } from '@/shared/application/providers/hash-provider'
import { BcryptHashProvider } from '@/users/infrastructure/providers/hash-provider/bcrypt-hash.provider'
import { InvalidPasswordError } from '@/shared/application/errors/invalid-password-error'

describe('UpdatePassowrdUseCase integration tests', () => {
  const prismaService = new PrismaClient()
  let sut: UpdatePasswordUseCase.UseCase
  let repository: UserPrismaRepository
  let hashProvider: HashProvider
  let module: TestingModule

  beforeAll(async () => {
    setupPrismaTests()
    module = await Test.createTestingModule({
      imports: [DatabaseModule.forTest(prismaService)],
    }).compile()
    repository = new UserPrismaRepository(prismaService as any)
    hashProvider = new BcryptHashProvider()
  })

  beforeEach(async () => {
    await prismaService.user.deleteMany()
    sut = new UpdatePasswordUseCase.UseCase(repository, hashProvider)
  })

  afterAll(async () => {
    await module.close()
  })

  it('should throws error when entity not found', async () => {
    await expect(() =>
      sut.execute({ id: 'fakeid', oldPassword: 'test', password: 'test' }),
    ).rejects.toThrow(new NotFoundError(`UserModel not found using ID fakeid`))
  })

  it('should throws error when password not provided', async () => {
    const entity = new UserEntity(UserDataBuilder({ password: '1234' }))
    await prismaService.user.create({ data: entity.toJSON() })

    await expect(() =>
      sut.execute({ id: entity.id, password: '', oldPassword: 'test' }),
    ).rejects.toThrow(
      new InvalidPasswordError('Old password and new password is required'),
    )
  })

  it('should throws error when old password not provided', async () => {
    const entity = new UserEntity(UserDataBuilder({ password: '1234' }))
    await prismaService.user.create({ data: entity.toJSON() })

    await expect(() =>
      sut.execute({ id: entity.id, password: 'test', oldPassword: '' }),
    ).rejects.toThrow(
      new InvalidPasswordError('Old password and new password is required'),
    )
  })

  it('should not update a user if password dont match', async () => {
    const oldPassword = await hashProvider.generateHash('1234')
    const entity = new UserEntity(UserDataBuilder({ password: oldPassword }))
    await prismaService.user.create({ data: entity.toJSON() })

    const spyCompareHash = jest.spyOn(hashProvider, 'compareHash')

    await expect(
      sut.execute({
        id: entity.id,
        password: 'test',
        oldPassword: '12345',
      }),
    ).rejects.toThrow(new InvalidPasswordError('Old password does not match'))

    expect(spyCompareHash).toHaveBeenCalledTimes(1)
  })

  it('should update users password', async () => {
    const oldPassword = await hashProvider.generateHash('1234')
    const entity = new UserEntity(UserDataBuilder({ password: oldPassword }))
    await prismaService.user.create({ data: entity.toJSON() })

    const output = await sut.execute({
      id: entity.id,
      password: 'new pass',
      oldPassword: '1234',
    })

    const result = await hashProvider.compareHash('new pass', output.password)

    expect(result).toBeTruthy()
  })
})
