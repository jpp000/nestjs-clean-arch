import { SortDirection } from '@/shared/domain/repositories/searchable-repository-contracts'
import { ListUsersUseCase } from '@/users/application/usecases/listusers.usecase'

export class ListUsersDto implements ListUsersUseCase.Input {
  page?: number
  perPage?: number
  sort?: string | null
  sortDir?: SortDirection
  filter?: string
}
