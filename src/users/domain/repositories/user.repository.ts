import { UserEntity } from '../entities/user.entity'
import {
  SearchableRepositoryInterface,
  SearchParams,
  SearchResult,
} from '@/shared/domain/repositories/searchable-repository-contracts'

export type Filter = string

export class UserSearchParams extends SearchParams<Filter> {}

export class UserSearchResult extends SearchResult<UserEntity, Filter> {}

export interface UserRepository
  extends SearchableRepositoryInterface<
    UserEntity,
    Filter,
    UserSearchParams,
    UserSearchResult
  > {
  findByEmail(email: string): Promise<UserEntity>
  emailExists(email: string): Promise<void>
}
