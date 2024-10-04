import { validate as uuidValidate } from 'uuid'
import { Entity } from '../../entity'

type StubProps = {
  prop1: string
  prop2: number
}

class StubEntity extends Entity<StubProps> {}

describe('UserEntity unit tests', () => {
  it('should set props and id', () => {
    const props = { prop1: 'value1', prop2: 15 }
    const entity = new StubEntity(props)

    expect(entity.props).toStrictEqual(props)
    expect(entity._id).not.toBeNull()
    expect(uuidValidate(entity._id)).toBeTruthy()
  })

  it('should accept a valid uuid', () => {
    const props = { prop1: 'value1', prop2: 15 }
    const id = 'c1d43b26-0794-438c-b3f9-ffb9ac3a91d3'
    const entity = new StubEntity(props, id)

    expect(uuidValidate(entity._id)).toBeTruthy()
    expect(entity._id).toBe(id)
  })

  it('should convert entity to object', () => {
    const props = { prop1: 'value1', prop2: 15 }
    const id = 'c1d43b26-0794-438c-b3f9-ffb9ac3a91d3'
    const entity = new StubEntity(props, id)

    expect(entity.toJSON()).toStrictEqual({
      id,
      ...props,
    })
  })
})
