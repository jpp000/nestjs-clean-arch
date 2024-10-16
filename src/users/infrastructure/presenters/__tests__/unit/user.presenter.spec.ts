import { instanceToPlain } from 'class-transformer'
import { UserColletionPresenter, UserPresenter } from '../../user.presenter'
import { PaginationPresenter } from '@/shared/infraestructure/presenters/pagination.presenter'

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
    it('should set values', () => {
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

describe('UserCollectionPresenter unit tests', () => {
  const createdAt = new Date()
  const props = {
    id: '6781a562-2727-4390-81ed-e1d128e267d6',
    name: 'a',
    email: 'a@a.com',
    password: '1234',
    createdAt,
  }

  describe('constructor', () => {
    it('should set values', () => {
      const sut = new UserColletionPresenter({
        items: [props],
        currentPage: 1,
        perPage: 2,
        lastPage: 1,
        total: 1,
      })
      expect(sut.meta).toBeInstanceOf(PaginationPresenter)
      expect(sut.meta).toStrictEqual(
        new PaginationPresenter({
          currentPage: 1,
          perPage: 2,
          lastPage: 1,
          total: 1,
        }),
      )
      expect(sut.data).toStrictEqual([new UserPresenter(props)])
    })
  })

  it('should presenter data', () => {
    let sut = new UserColletionPresenter({
      items: [props],
      currentPage: 1,
      perPage: 2,
      lastPage: 1,
      total: 1,
    })
    let output = instanceToPlain(sut)
    expect(output).toStrictEqual({
      data: [
        {
          id: '6781a562-2727-4390-81ed-e1d128e267d6',
          name: 'a',
          email: 'a@a.com',
          createdAt: createdAt.toISOString(),
        },
      ],
      meta: { currentPage: 1, perPage: 2, lastPage: 1, total: 1 },
    })

    sut = new UserColletionPresenter({
      items: [props],
      currentPage: '1' as any,
      perPage: '2' as any,
      lastPage: '1' as any,
      total: '1' as any,
    })
    output = instanceToPlain(sut)
    expect(output).toStrictEqual({
      data: [
        {
          id: '6781a562-2727-4390-81ed-e1d128e267d6',
          name: 'a',
          email: 'a@a.com',
          createdAt: createdAt.toISOString(),
        },
      ],
      meta: { currentPage: 1, perPage: 2, lastPage: 1, total: 1 },
    })
  })
})
