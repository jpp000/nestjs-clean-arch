import { Transform } from 'class-transformer'
import { UserOutput } from '../../application/dto/user-output.dto'
import { CollectionPresenter } from '@/shared/infraestructure/presenters/collection.presenter'
import { ListUsersUseCase } from '@/users/application/usecases/listusers.usecase'

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

export class UserColletionPresenter extends CollectionPresenter {
  data: UserPresenter[]

  constructor(output: ListUsersUseCase.Output) {
    const { items, ...paginationProps } = output
    super(paginationProps)
    this.data = items.map(item => new UserPresenter(item))
  }
}
