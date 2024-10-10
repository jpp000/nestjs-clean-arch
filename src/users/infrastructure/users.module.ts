import { Module } from '@nestjs/common'
import { UsersController } from './users.controller'
import { UserInMemoryRepository } from './database/in-memory/repositories/user-in-memory.repository'
import { BcryptHashProvider } from './providers/hash-provider/bcrypt-hash.provider'
import { SigninUseCase } from '../application/usecases/signin.usecase'
import { UserRepository } from '../domain/repositories/user.repository'
import { HashProvider } from '@/shared/application/providers/hash-provider'
import { SignupUseCase } from '../application/usecases/signup.usecase'
import { GetUserUseCase } from '../application/usecases/getuser.usecase'
import { ListUsersUseCase } from '../application/usecases/listusers.usecase'
import { DeleteUserUseCase } from '../application/usecases/delete-user.usecase'
import { UpdatePasswordUseCase } from '../application/usecases/update-password.usecase'
import { UpdateUserUseCase } from '../application/usecases/update-user.usecase'
import { PrismaService } from '@/shared/infraestructure/database/prisma/prisma.service'
import { UserPrismaRepository } from './database/prisma/repositories/user-prisma.repository'

@Module({
  controllers: [UsersController],
  providers: [
    PrismaService,
    {
      provide: 'UserRepository',
      useFactory: (prismaService: PrismaService) => {
        return new UserPrismaRepository(prismaService)
      },
      inject: [PrismaService],
    },
    {
      provide: 'HashProvider',
      useClass: BcryptHashProvider,
    },
    {
      provide: SigninUseCase.UseCase,
      useFactory: (
        userRepository: UserRepository,
        hashProvider: HashProvider,
      ) => {
        return new SigninUseCase.UseCase(userRepository, hashProvider)
      },
      inject: ['UserRepository', 'HashProvider'],
    },
    {
      provide: SignupUseCase.UseCase,
      useFactory: (
        userRepository: UserRepository,
        hashProvider: HashProvider,
      ) => {
        return new SignupUseCase.UseCase(userRepository, hashProvider)
      },
      inject: ['UserRepository', 'HashProvider'],
    },
    {
      provide: GetUserUseCase.UseCase,
      useFactory: (userRepository: UserRepository) => {
        return new GetUserUseCase.UseCase(userRepository)
      },
      inject: ['UserRepository'],
    },
    {
      provide: ListUsersUseCase.UseCase,
      useFactory: (userRepository: UserRepository) => {
        return new ListUsersUseCase.UseCase(userRepository)
      },
      inject: ['UserRepository'],
    },
    {
      provide: DeleteUserUseCase.UseCase,
      useFactory: (userRepository: UserRepository) => {
        return new DeleteUserUseCase.UseCase(userRepository)
      },
      inject: ['UserRepository'],
    },
    {
      provide: UpdatePasswordUseCase.UseCase,
      useFactory: (
        userRepository: UserRepository,
        hashProvider: HashProvider,
      ) => {
        return new UpdatePasswordUseCase.UseCase(userRepository, hashProvider)
      },
      inject: ['UserRepository', 'HashProvider'],
    },
    {
      provide: UpdateUserUseCase.UseCase,
      useFactory: (userRepository: UserRepository) => {
        return new UpdateUserUseCase.UseCase(userRepository)
      },
      inject: ['UserRepository'],
    },
  ],
})
export class UsersModule {}
