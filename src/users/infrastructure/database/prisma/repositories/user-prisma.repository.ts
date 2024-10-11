import { NotFoundError } from '@/shared/domain/errors/not-found-error'
import { PrismaService } from '@/shared/infraestructure/database/prisma/prisma.service'
import { UserEntity } from '@/users/domain/entities/user.entity'
import {
  UserRepository,
  UserSearchParams,
  UserSearchResult,
} from '@/users/domain/repositories/user.repository'
import { UserModelMapper } from '../models/user-model.mapper'

export class UserPrismaRepository implements UserRepository {
  sortableFields: string[]

  constructor(private readonly prismaService: PrismaService) {}

  async findByEmail(email: string): Promise<UserEntity> {
    const user = await this.prismaService.user.findUnique({
      where: {
        email,
      },
    })

    const u = new UserEntity({ ...user })
    return u
  }

  async emailExists(email: string): Promise<void> {
    throw new Error('Method not implemented.')
  }

  async search(props: UserSearchParams): Promise<UserSearchResult> {
    throw new Error('Method not implemented.')
  }

  async insert(entity: UserEntity): Promise<void> {
    await this.prismaService.user.create({
      data: entity.toJSON(),
    })
  }

  async findById(id: string): Promise<UserEntity> {
    return this._get(id)
  }

  async findAll(): Promise<UserEntity[]> {
    const models = await this.prismaService.user.findMany()
    return models.map(model => UserModelMapper.toEntity(model))
  }

  async update(entity: UserEntity): Promise<void> {
    throw new Error('Method not implemented.')
  }

  async delete(id: string): Promise<void> {
    throw new Error('Method not implemented.')
  }

  protected async _get(id: string): Promise<UserEntity> {
    try {
      const user = await this.prismaService.user.findUnique({
        where: {
          id,
        },
      })
      return UserModelMapper.toEntity(user)
    } catch {
      throw new NotFoundError(`UserModel not found using ID ${id}`)
    }
  }
}
