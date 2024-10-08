import { SigninUseCase } from '@/users/application/usecases/signin.usecase'

export class SigninUserDto implements SigninUseCase.Input {
  email: string
  password: string
}
