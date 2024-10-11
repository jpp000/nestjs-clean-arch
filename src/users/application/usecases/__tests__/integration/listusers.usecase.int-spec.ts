import { PrismaClient } from '@prisma/client'
import { UserPrismaRepository } from '@/users/infrastructure/database/prisma/repositories/user-prisma.repository'
import { Test, TestingModule } from '@nestjs/testing'
import { setupPrismaTests } from '@/shared/infraestructure/database/prisma/testing/setup-prisma-tests'
import { DatabaseModule } from '@/shared/infraestructure/database/database.module'
import { NotFoundError } from '@/shared/domain/errors/not-found-error'
import { UserDataBuilder } from '@/users/domain/testing/helpers/user-data-builder'
import { UserEntity } from '@/users/domain/entities/user.entity'
import { ListUsersUseCase } from '../../listusers.usecase'

describe('ListUsersUseCase integration tests', () => {
  const prismaService = new PrismaClient()
  let sut: ListUsersUseCase.UseCase
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
    sut = new ListUsersUseCase.UseCase(repository)
  })

  afterAll(async () => {
    await module.close()
  })

  it('should return the users ordered by createdAt', async () => {
    const createdAt = new Date()
    const entities: UserEntity[] = []
    const arrange = Array(3).fill(UserDataBuilder({}))

    arrange.forEach((item, idx) =>
      entities.push(
        new UserEntity({
          ...item,
          email: `test${idx}@test.com`,
          createdAt: new Date(createdAt.getTime() + idx),
        }),
      ),
    )

    await prismaService.user.createMany({
      data: entities.map(item => item.toJSON()),
    })

    const output = await sut.execute({})

    expect(output).toStrictEqual({
      items: entities.reverse().map(item => item.toJSON()),
      total: 3,
      currentPage: 1,
      perPage: 15,
      lastPage: 1,
    })
  })
})
