import { setupPrismaTests } from '@/shared/infraestructure/database/prisma/testing/setup-prisma-tests'
import { PrismaClient } from '@prisma/client'
import { UserPrismaRepository } from '../../user-prisma.repository'
import { Test, TestingModule } from '@nestjs/testing'
import { DatabaseModule } from '@/shared/infraestructure/database/database.module'
import { NotFoundError } from '@/shared/domain/errors/not-found-error'
import { UserEntity } from '@/users/domain/entities/user.entity'
import { UserDataBuilder } from '@/users/domain/testing/helpers/user-data-builder'
import {
  UserSearchParams,
  UserSearchResult,
} from '@/users/domain/repositories/user.repository'
import { ConflictError } from '@/shared/domain/errors/conflict-error'

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
    await expect(() => sut.findById('fakeid')).rejects.toThrow(
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

  it('should return all users', async () => {
    const entity = new UserEntity(UserDataBuilder({}))
    await prismaService.user.create({
      data: entity,
    })

    const entities = await sut.findAll()

    entities.map(item => expect(item.toJSON()).toStrictEqual(entity.toJSON()))
    expect(entities).toHaveLength(1)
    expect(entities).toStrictEqual([entity])
  })

  it('should throw error on update when a entity is not found', async () => {
    const entity = new UserEntity(UserDataBuilder({}))
    await expect(() => sut.update(entity)).rejects.toThrow(
      new NotFoundError(`UserModel not found using ID ${entity.id}`),
    )
  })

  it('should update entity', async () => {
    const entity = new UserEntity(UserDataBuilder({}))
    await prismaService.user.create({
      data: entity,
    })

    entity.update('new name')

    await sut.update(entity)

    const output = await prismaService.user.findUnique({
      where: {
        id: entity.id,
      },
    })

    expect(output.name).toBe('new name')
  })

  it('should throw error on delete when a entity is not found', async () => {
    const entity = new UserEntity(UserDataBuilder({}))
    await expect(() => sut.delete(entity.id)).rejects.toThrow(
      new NotFoundError(`UserModel not found using ID ${entity.id}`),
    )
  })

  it('should delete entity', async () => {
    const entity = new UserEntity(UserDataBuilder({}))
    await prismaService.user.create({
      data: entity,
    })

    await sut.delete(entity.id)

    const output1 = await sut.findAll()
    const output2 = await prismaService.user.findUnique({
      where: {
        id: entity.id,
      },
    })

    expect(output2).toBeNull()
    expect(output1).toHaveLength(0)
  })

  it('should throw error on find email when a entity is not found', async () => {
    await expect(() => sut.findByEmail('a@a.com')).rejects.toThrow(
      new NotFoundError(`UserModel not found using email a@a.com`),
    )
  })

  it('should finds a entity by email', async () => {
    const entity = new UserEntity(UserDataBuilder({ email: 'a@a.com' }))

    await prismaService.user.create({
      data: entity.toJSON(),
    })

    const output = await sut.findByEmail('a@a.com')

    expect(output.toJSON()).toStrictEqual(entity.toJSON())
  })

  it('should throw error when a entity is found by email', async () => {
    const entity = new UserEntity(UserDataBuilder({ email: 'a@a.com' }))

    await prismaService.user.create({
      data: entity.toJSON(),
    })

    await await expect(() => sut.emailExists('a@a.com')).rejects.toThrow(
      new ConflictError('Email address already used'),
    )
  })

  it('should finds a entity by email', async () => {
    expect.assertions(0)
    await sut.emailExists('a@a.com')
  })

  describe('search method tests', () => {
    it('should apply only pagination when the other params are null', async () => {
      const createdAt = new Date()
      const entities: UserEntity[] = []
      const arrange = Array(16).fill(UserDataBuilder({}))

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

      const searchOutput = await sut.search(new UserSearchParams())
      const { items } = searchOutput

      expect(searchOutput).toBeInstanceOf(UserSearchResult)
      expect(searchOutput.total).toBe(16)
      expect(items.length).toBe(15)
      searchOutput.items.forEach(item =>
        expect(item).toBeInstanceOf(UserEntity),
      )
      items.reverse().forEach((item, idx) => {
        expect(item.email).toBe(`test${idx + 1}@test.com`)
      })
    })

    it('should search using filter, sort and paginate', async () => {
      const createdAt = new Date()
      const entities: UserEntity[] = []
      const arrange = ['test', 'a', 'TEST', 'b', 'TeSt']

      arrange.forEach((item, idx) =>
        entities.push(
          new UserEntity({
            ...UserDataBuilder({ name: item }),

            createdAt: new Date(createdAt.getTime() + idx),
          }),
        ),
      )

      await prismaService.user.createMany({
        data: entities.map(item => item.toJSON()),
      })

      const searchOutputPage1 = await sut.search(
        new UserSearchParams({
          page: 1,
          perPage: 2,
          sort: 'name',
          sortDir: 'asc',
          filter: 'TEST',
        }),
      )

      expect(searchOutputPage1).toBeInstanceOf(UserSearchResult)

      expect(searchOutputPage1.items[0].toJSON()).toStrictEqual(
        entities[0].toJSON(),
      )
      expect(searchOutputPage1.items[1].toJSON()).toStrictEqual(
        entities[4].toJSON(),
      )

      const searchOutputPage2 = await sut.search(
        new UserSearchParams({
          page: 2,
          perPage: 2,
          sort: 'name',
          sortDir: 'asc',
          filter: 'TEST',
        }),
      )

      expect(searchOutputPage2.items[0].toJSON()).toStrictEqual(
        entities[2].toJSON(),
      )
    })
  })
})
