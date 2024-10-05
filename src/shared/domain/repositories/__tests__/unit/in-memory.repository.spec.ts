import { Entity } from '@/shared/domain/entities/entity'
import { InMemoryRepository } from '../../in-memory.repository'
import { NotFoundError } from '@/shared/domain/errors/not-found-error'

type StubEntityProps = {
  name: string
  price: number
}

class StubEntity extends Entity<StubEntityProps> {}

class StubInMemoryRepository extends InMemoryRepository<StubEntity> {}

describe('InMemoryRepository unit tests', () => {
  let sut: StubInMemoryRepository

  beforeEach(() => {
    sut = new StubInMemoryRepository()
  })

  it('should inserts a new entity', async () => {
    const entity = new StubEntity({
      name: 'test name',
      price: 50,
    })
    await sut.insert(entity)

    expect(entity.toJSON()).toStrictEqual(sut.items[0].toJSON())
  })

  it('should throw an error when entity not found', async () => {
    await expect(sut.findById('fakeId')).rejects.toThrow(
      new NotFoundError('Entity not found'),
    )
  })

  it('should find a entity by id', async () => {
    const entity = new StubEntity({
      name: 'test name',
      price: 50,
    })
    await sut.insert(entity)
    const result = await sut.findById(entity.id)

    expect(entity.toJSON()).toStrictEqual(result.toJSON())
  })

  it('should return all entities', async () => {
    const entity = new StubEntity({
      name: 'test name',
      price: 50,
    })
    await sut.insert(entity)
    const result = await sut.findAll()

    expect([entity]).toStrictEqual(result)
  })

  it('should throw an error on update when entity not found', async () => {
    const entity = new StubEntity({
      name: 'test name',
      price: 50,
    })
    await expect(sut.update(entity)).rejects.toThrow(
      new NotFoundError('Entity not found'),
    )
  })

  it('should update a entity', async () => {
    const entity = new StubEntity({
      name: 'test name',
      price: 50,
    })
    await sut.insert(entity)
    const entityUpdated = new StubEntity(
      {
        name: 'updated',
        price: 10,
      },
      entity._id,
    )
    await sut.update(entityUpdated)

    expect(entityUpdated.toJSON()).toStrictEqual(sut.items[0].toJSON())
  })

  it('should throw an error on delete when entity not found', async () => {
    await expect(sut.delete('fakeId')).rejects.toThrow(
      new NotFoundError('Entity not found'),
    )
  })

  it('should delete a entity by id', async () => {
    const entity = new StubEntity({
      name: 'test name',
      price: 50,
    })
    await sut.insert(entity)
    await sut.delete(entity.id)

    expect(sut.items).toHaveLength(0)
  })
})
