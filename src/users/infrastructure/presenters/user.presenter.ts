import { Transform } from 'class-transformer'
import { UserOutput } from '../../application/dto/user-output.dto'

export class UserPresenter {
  id: string
  name: string
  email: string
  @Transform(({ value }: { value: Date }) => value.toISOString())
  createdAt: Date

  constructor(output: UserOutput) {
    this.id = output.id
    this.name = output.name
    this.email = output.email
    this.createdAt = output.createdAt
  }
}
