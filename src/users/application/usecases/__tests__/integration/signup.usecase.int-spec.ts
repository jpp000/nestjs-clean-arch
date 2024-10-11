import { PrismaClient } from '@prisma/client'
import { SignupUseCase } from '../../signup.usecase'
import { UserPrismaRepository } from '@/users/infrastructure/database/prisma/repositories/user-prisma.repository'
import { Test, TestingModule } from '@nestjs/testing'
import { setupPrismaTests } from '@/shared/infraestructure/database/prisma/testing/setup-prisma-tests'
import { DatabaseModule } from '@/shared/infraestructure/database/database.module'
import { HashProvider } from '@/shared/application/providers/hash-provider'
import { BcryptHashProvider } from '@/users/infrastructure/providers/hash-provider/bcrypt-hash.provider'

describe('SignupUseCase integration tests', () => {
  const prismaService = new PrismaClient()
  let sut: SignupUseCase.UseCase
  let repository: UserPrismaRepository
  let hashProvider: HashProvider
  let module: TestingModule

  beforeAll(async () => {
    setupPrismaTests()
    module = await Test.createTestingModule({
      imports: [DatabaseModule.forTest(prismaService)],
    }).compile()
    repository = new UserPrismaRepository(prismaService as any)
    hashProvider = new BcryptHashProvider()
  })

  beforeEach(async () => {
    await prismaService.user.deleteMany()
    sut = new SignupUseCase.UseCase(repository, hashProvider)
  })

  afterAll(async () => {
    await module.close()
  })

  it('should create a user', async () => {
    const props: SignupUseCase.Input = {
      name: 'test name',
      email: 'a@a.com',
      password: '1234',
    }
    const output = await sut.execute(props)

    expect(output.id).toBeDefined()
    expect(output.createdAt).toBeInstanceOf(Date)
  })
})
