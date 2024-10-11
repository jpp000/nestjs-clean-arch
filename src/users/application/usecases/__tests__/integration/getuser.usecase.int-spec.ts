import { PrismaClient } from '@prisma/client'
import { UserPrismaRepository } from '@/users/infrastructure/database/prisma/repositories/user-prisma.repository'
import { Test, TestingModule } from '@nestjs/testing'
import { setupPrismaTests } from '@/shared/infraestructure/database/prisma/testing/setup-prisma-tests'
import { DatabaseModule } from '@/shared/infraestructure/database/database.module'
import { NotFoundError } from '@/shared/domain/errors/not-found-error'
import { UserDataBuilder } from '@/users/domain/testing/helpers/user-data-builder'
import { UserEntity } from '@/users/domain/entities/user.entity'
import { GetUserUseCase } from '../../getuser.usecase'

describe('GetUserUseCase integration tests', () => {
  const prismaService = new PrismaClient()
  let sut: GetUserUseCase.UseCase
  let repository: UserPrismaRepository
  let module: TestingModule

  beforeAll(async () => {
    setupPrismaTests()
    module = await Test.createTestingModule({
      imports: [DatabaseModule.forTest(prismaService)],
    }).compile()
    repository = new UserPrismaRepository(prismaService as any)
  })

  beforeEach(async () => {
    await prismaService.user.deleteMany()
    sut = new GetUserUseCase.UseCase(repository)
  })

  afterAll(async () => {
    await module.close()
  })

  it('should throws error when entity not found', async () => {
    await expect(() => sut.execute({ id: 'fakeid' })).rejects.toThrow(
      new NotFoundError(`UserModel not found using ID fakeid`),
    )
  })

  it('should gets a user', async () => {
    const entity = new UserEntity(UserDataBuilder({}))
    await prismaService.user.create({ data: entity.toJSON() })

    const output = await sut.execute({ id: entity.id })

    const models = await prismaService.user.findMany()

    expect(output).toStrictEqual(entity.toJSON())
    expect(models).toStrictEqual([output])
  })
})
