import { UserRepository } from '@/users/domain/repositories/user.repository'
import { UserOutput } from '../dto/user-output.dto'
import { UseCase as DefaultUseCase } from '@/shared/application/usecases/use-case'

export namespace GetUserUseCase {
  export type Input = {
    id: string
  }

  export type Output = UserOutput

  export class UseCase implements DefaultUseCase<Input, Output> {
    constructor(private readonly userRepository: UserRepository) {}

    async execute(input: Input): Promise<Output> {
      const entity = await this.userRepository.findById(input.id)

      return entity.toJSON()
    }
  }
}
