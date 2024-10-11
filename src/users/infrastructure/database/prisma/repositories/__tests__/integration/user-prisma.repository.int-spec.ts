import { setupPrismaTests } from '@/shared/infraestructure/database/prisma/testing/setup-prisma-tests'
import { PrismaClient } from '@prisma/client'
import { UserPrismaRepository } from '../../user-prisma.repository'
import { Test, TestingModule } from '@nestjs/testing'
import { DatabaseModule } from '@/shared/infraestructure/database/database.module'
import { NotFoundError } from '@/shared/domain/errors/not-found-error'
import { UserEntity } from '@/users/domain/entities/user.entity'
import { UserDataBuilder } from '@/users/domain/testing/helpers/user-data-builder'

describe('UserPrismaRepository integration tests', () => {
  const prismaService = new PrismaClient()
  let sut: UserPrismaRepository
  let module: TestingModule

  beforeAll(async () => {
    setupPrismaTests()
    module = await Test.createTestingModule({
      imports: [DatabaseModule.forTest(prismaService)],
    }).compile()
  })

  beforeEach(async () => {
    sut = new UserPrismaRepository(prismaService as any)
    await prismaService.user.deleteMany()
  })

  it('should throws error when not found', async () => {
    expect(() => sut.findById('fakeid')).rejects.toThrow(
      new NotFoundError('UserModel not found using ID fakeid'),
    )
  })

  it('should finds a entity by id', async () => {
    const entity = new UserEntity(UserDataBuilder({}))
    await prismaService.user.create({
      data: entity,
    })

    const result = await sut.findById(entity.id)

    expect(result).toStrictEqual(entity)
  })

  it('should insert a new entity', async () => {
    const entity = new UserEntity(UserDataBuilder({}))

    await sut.insert(entity)

    const result = await prismaService.user.findUnique({
      where: {
        id: entity.id,
      },
    })

    expect(result).toStrictEqual(entity.toJSON())
  })
})
