import { UserOutput } from '@/users/application/dto/user-output.dto'
import { UsersController } from '../../users.controller'
import { SignupUseCase } from '@/users/application/usecases/signup.usecase'
import { SigninUseCase } from '@/users/application/usecases/signin.usecase'
import { SigninDto } from '../../dto/signin.dto'
import { SignupDto } from '../../dto/signup.dto'
import { UpdateUserUseCase } from '@/users/application/usecases/update-user.usecase'
import { UpdateUserDto } from '../../dto/update-user.dto'
import { UpdatePasswordUseCase } from '@/users/application/usecases/update-password.usecase'
import { UpdatePasswordDto } from '../../dto/update-password.dto'
import { GetUserUseCase } from '@/users/application/usecases/getuser.usecase'
import { ListUsersUseCase } from '@/users/application/usecases/listusers.usecase'
import {
  UserColletionPresenter,
  UserPresenter,
} from '../../presenters/user.presenter'

describe('UsersController unit tests', () => {
  let sut: UsersController
  let props: UserOutput
  let id: string

  beforeEach(async () => {
    sut = new UsersController()
    id = '6781a562-2727-4390-81ed-e1d128e267d6'
    props = {
      id,
      name: 'a',
      email: 'a@a.com',
      password: '1234',
      createdAt: new Date(),
    }
  })

  it('should be defined', () => {
    expect(sut).toBeDefined()
  })

  it('should create a user', async () => {
    const output: SignupUseCase.Output = props
    const mockSignupUseCase = {
      execute: jest.fn().mockReturnValue(Promise.resolve(output)),
    }

    sut['signupUseCase'] = mockSignupUseCase as any

    const input: SignupDto = {
      name: 'a',
      email: 'a@a.com',
      password: '1234',
    }

    const presenter = await sut.create(input)

    expect(presenter).toBeInstanceOf(UserPresenter)
    expect(presenter).toStrictEqual(new UserPresenter(output))
    expect(mockSignupUseCase.execute).toHaveBeenCalledWith(input)
  })

  it('should authenticate a user', async () => {
    const output = 'fake_token'
    const mockSigninUseCase = {
      execute: jest.fn().mockReturnValue(Promise.resolve(output)),
    }

    const mockAuthService = {
      generateJwt: jest.fn().mockReturnValue(Promise.resolve(output)),
    }

    sut['signinUseCase'] = mockSigninUseCase as any
    sut['authService'] = mockAuthService as any

    const input: SigninDto = {
      email: 'a@a.com',
      password: '1234',
    }

    const result = await sut.login(input)

    expect(result).toEqual(output)
    expect(mockSigninUseCase.execute).toHaveBeenCalledWith(input)
  })

  it('should update a user', async () => {
    const output: UpdateUserUseCase.Output = props
    const mockUpdateUserUseCase = {
      execute: jest.fn().mockReturnValue(Promise.resolve(output)),
    }

    sut['updateUserUseCase'] = mockUpdateUserUseCase as any

    const input: UpdateUserDto = {
      name: 'new name',
    }

    const presenter = await sut.update(id, input)

    expect(presenter).toBeInstanceOf(UserPresenter)
    expect(presenter).toStrictEqual(new UserPresenter(output))
    expect(mockUpdateUserUseCase.execute).toHaveBeenCalledWith({ id, ...input })
  })

  it('should update users password', async () => {
    const output: UpdatePasswordUseCase.Output = props
    const mockUpdatePasswordUseCase = {
      execute: jest.fn().mockReturnValue(Promise.resolve(output)),
    }

    sut['updatePasswordUseCase'] = mockUpdatePasswordUseCase as any

    const input: UpdatePasswordDto = {
      oldPassword: '1234',
      password: '123456',
    }

    const presenter = await sut.updatePassword(id, input)

    expect(presenter).toBeInstanceOf(UserPresenter)
    expect(presenter).toStrictEqual(new UserPresenter(output))
    expect(mockUpdatePasswordUseCase.execute).toHaveBeenCalledWith({
      id,
      ...input,
    })
  })

  it('should delete a user', async () => {
    const output = undefined
    const mockDeleteUserUseCase = {
      execute: jest.fn().mockReturnValue(output),
    }

    sut['deleteUserUseCase'] = mockDeleteUserUseCase as any

    const result = await sut.remove(id)

    expect(result).toStrictEqual(output)
    expect(mockDeleteUserUseCase.execute).toHaveBeenCalledWith({
      id,
    })
  })

  it('should gets a user', async () => {
    const output: GetUserUseCase.Output = props
    const mockGetUserUseCase = {
      execute: jest.fn().mockReturnValue(Promise.resolve(output)),
    }

    sut['getUserUseCase'] = mockGetUserUseCase as any

    const presenter = await sut.findOne(id)

    expect(presenter).toBeInstanceOf(UserPresenter)
    expect(presenter).toStrictEqual(new UserPresenter(output))
    expect(mockGetUserUseCase.execute).toHaveBeenCalledWith({
      id,
    })
  })

  it('should list users', async () => {
    const output: ListUsersUseCase.Output = {
      items: [props],
      currentPage: 1,
      lastPage: 1,
      perPage: 1,
      total: 1,
    }
    const mockListUsersUseCase = {
      execute: jest.fn().mockReturnValue(Promise.resolve(output)),
    }

    sut['listUsersUseCase'] = mockListUsersUseCase as any

    const searchParams = {
      page: 1,
      perPage: 1,
    }

    const presenter = await sut.search(searchParams)

    expect(presenter).toBeInstanceOf(UserColletionPresenter)
    expect(presenter).toEqual(new UserColletionPresenter(output))
    expect(mockListUsersUseCase.execute).toHaveBeenCalledWith(searchParams)
  })
})
