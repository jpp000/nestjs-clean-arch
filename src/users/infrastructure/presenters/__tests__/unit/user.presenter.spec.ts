import { instanceToPlain } from 'class-transformer'
import { UserPresenter } from '../../user.presenter'

describe('UserPresenter unit tests', () => {
  const createdAt = new Date()
  const props = {
    id: '6781a562-2727-4390-81ed-e1d128e267d6',
    name: 'a',
    email: 'a@a.com',
    password: '1234',
    createdAt,
  }
  let sut: UserPresenter

  beforeEach(() => {
    sut = new UserPresenter(props)
  })

  describe('constructor', () => {
    it('should be defined', () => {
      expect(sut.id).toEqual(props.id)
      expect(sut.name).toEqual(props.name)
      expect(sut.email).toEqual(props.email)
      expect(sut.createdAt).toEqual(props.createdAt)
    })
  })

  it('should presenter data', () => {
    const output = instanceToPlain(sut)
    expect(output).toStrictEqual({
      id: '6781a562-2727-4390-81ed-e1d128e267d6',
      name: 'a',
      email: 'a@a.com',
      createdAt: createdAt.toISOString(),
    })
  })
})
