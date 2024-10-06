import { UserRepository } from '@/users/domain/repositories/user.repository'
import { SignupUseCase } from '../../signup.usecase'
import { UserInMemoryRepository } from '@/users/infrastructure/database/in-memory/repositories/user-in-memory.repository'
import { HashProvider } from '@/shared/application/providers/hash-provider'
import { BcryptHashProvider } from '@/users/infrastructure/providers/hash-provider/bcrypt-hash.provider'
import { UserDataBuilder } from '@/users/domain/testing/helpers/user-data-builder'
import { ConflictError } from '@/shared/domain/errors/conflict-error'
import { BadRequestError } from '@/users/application/errors/bad-request-error'

describe('SignupUsecase unit tests', () => {
  let sut: SignupUseCase.UseCase
  let repository: UserRepository
  let hashProvider: HashProvider

  beforeEach(() => {
    repository = new UserInMemoryRepository()
    hashProvider = new BcryptHashProvider()

    sut = new SignupUseCase.UseCase(repository, hashProvider)
  })

  it('should create a new user', async () => {
    const spyInsert = jest.spyOn(repository, 'insert')
    const props = UserDataBuilder({})

    const result = await sut.execute({
      name: props.name,
      email: props.email,
      password: props.password,
    })

    expect(result.id).toBeDefined()
    expect(result.createdAt).toBeInstanceOf(Date)
    expect(spyInsert).toHaveBeenCalledTimes(1)
    expect(props.password).not.toEqual(result.password)
  })

  it('should not be able to register with same email twice', async () => {
    const props = UserDataBuilder({ email: 'a@a.com' })
    await sut.execute(props)

    await expect(() => sut.execute(props)).rejects.toBeInstanceOf(ConflictError)
  })

  it('should throw error when name not provided', async () => {
    const props = Object.assign(UserDataBuilder({}), { name: null })
    await expect(() => sut.execute(props)).rejects.toBeInstanceOf(
      BadRequestError,
    )
  })

  it('should throw error when email not provided', async () => {
    const props = Object.assign(UserDataBuilder({}), { email: null })
    await expect(() => sut.execute(props)).rejects.toBeInstanceOf(
      BadRequestError,
    )
  })

  it('should throw error when password not provided', async () => {
    const props = Object.assign(UserDataBuilder({}), { password: null })
    await expect(() => sut.execute(props)).rejects.toBeInstanceOf(
      BadRequestError,
    )
  })
})
