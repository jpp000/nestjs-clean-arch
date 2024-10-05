import { SearchParams } from '../../searchable-repository-contracts'

describe('Searchable Repository unit tests', () => {
  describe('SearchParams tests', () => {
    it('page prop', () => {
      const sut = new SearchParams()
      expect(sut.page).toBe(1)

      const params = [
        { page: null as any, expected: 1 },
        { page: undefined, expected: 1 },
        { page: '', expected: 1 },
        { page: 'test', expected: 1 },
        { page: 0, expected: 1 },
        { page: -1, expected: 1 },
        { page: 5.5, expected: 1 },
        { page: true, expected: 1 },
        { page: false, expected: 1 },
        { page: {}, expected: 1 },
        { page: 1, expected: 1 },
        { page: 2, expected: 2 },
      ]

      params.forEach(param =>
        expect(new SearchParams({ page: param.page }).page).toBe(
          param.expected,
        ),
      )
    })

    it('perpage prop', () => {
      const sut = new SearchParams()
      expect(sut.perPage).toBe(15)

      const params = [
        { perPage: null as any, expected: 15 },
        { perPage: undefined, expected: 15 },
        { perPage: '', expected: 15 },
        { perPage: 'test', expected: 15 },
        { perPage: 0, expected: 15 },
        { perPage: -1, expected: 15 },
        { perPage: 5.5, expected: 15 },
        { perPage: true, expected: 15 },
        { perPage: false, expected: 15 },
        { perPage: {}, expected: 15 },
        { perPage: 1, expected: 1 },
        { perPage: 2, expected: 2 },
        { perPage: 25, expected: 25 },
      ]

      params.forEach(param =>
        expect(new SearchParams({ perPage: param.perPage }).perPage).toBe(
          param.expected,
        ),
      )
    })

    it('sort prop', () => {
      const sut = new SearchParams()
      expect(sut.sort).toBeNull()

      const params = [
        { sort: null as any, expected: null },
        { sort: undefined, expected: null },
        { sort: '', expected: null },
        { sort: 'test', expected: 'test' },
        { sort: 0, expected: '0' },
        { sort: -1, expected: '-1' },
        { sort: 5.5, expected: '5.5' },
        { sort: true, expected: 'true' },
        { sort: false, expected: 'false' },
        { sort: {}, expected: '[object Object]' },
        { sort: 1, expected: '1' },
        { sort: 2, expected: '2' },
        { sort: 25, expected: '25' },
      ]

      params.forEach(param =>
        expect(new SearchParams({ sort: param.sort }).sort).toBe(
          param.expected,
        ),
      )
    })

    it('sortDir prop', () => {
      let sut = new SearchParams()
      expect(sut.sortDir).toBeNull()

      sut = new SearchParams({ sort: null })
      expect(sut.sortDir).toBeNull()

      sut = new SearchParams({ sort: undefined })
      expect(sut.sortDir).toBeNull()

      sut = new SearchParams({ sort: '' })
      expect(sut.sortDir).toBeNull()

      const params = [
        { sortDir: null as any, expected: 'desc' },
        { sortDir: undefined, expected: 'desc' },
        { sortDir: '', expected: 'desc' },
        { sortDir: 'test', expected: 'desc' },
        { sortDir: 0, expected: 'desc' },
        { sortDir: 'desc', expected: 'desc' },
        { sortDir: 'asc', expected: 'asc' },
        { sortDir: 'ASC', expected: 'asc' },
        { sortDir: 'DESC', expected: 'desc' },
      ]

      params.forEach(param =>
        expect(
          new SearchParams({ sort: 'field', sortDir: param.sortDir }).sortDir,
        ).toBe(param.expected),
      )
    })

    it('filter prop', () => {
      const sut = new SearchParams()
      expect(sut.filter).toBeNull()

      const params = [
        { filter: null as any, expected: null },
        { filter: undefined, expected: null },
        { filter: '', expected: null },
        { filter: 'test', expected: 'test' },
        { filter: 0, expected: '0' },
        { filter: -1, expected: '-1' },
        { filter: 5.5, expected: '5.5' },
        { filter: true, expected: 'true' },
        { filter: false, expected: 'false' },
        { filter: {}, expected: '[object Object]' },
        { filter: 1, expected: '1' },
        { filter: 2, expected: '2' },
        { filter: 25, expected: '25' },
      ]

      params.forEach(param =>
        expect(new SearchParams({ filter: param.filter }).filter).toBe(
          param.expected,
        ),
      )
    })
  })
})
