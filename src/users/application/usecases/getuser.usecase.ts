import { UserRepository } from '@/users/domain/repositories/user.repository'
import { UserOutput } from '../dto/user-output.dto'

export namespace GetUserUseCase {
  export type Input = {
    id: string
  }

  export type Output = UserOutput

  export class UseCase {
    constructor(private readonly userRepository: UserRepository) {}

    async execute(input: Input): Promise<Output> {
      const entity = await this.userRepository.findById(input.id)

      return entity.toJSON()
    }
  }
}
