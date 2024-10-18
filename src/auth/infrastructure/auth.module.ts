import { Module } from '@nestjs/common'
import { AuthService } from './auth.service'
import { EnvConfigModule } from '@/shared/infraestructure/env-config/env-config.module'
import { JwtModule } from '@nestjs/jwt'
import { EnvConfigService } from '@/shared/infraestructure/env-config/env-config.service'

@Module({
  imports: [
    EnvConfigModule.forRoot(),
    JwtModule.registerAsync({
      imports: [EnvConfigModule],
      useFactory: async (configService: EnvConfigService) => ({
        global: true,
        secret: configService.getJwtSecret(),
        signOptions: { expiresIn: configService.getJwtExpiresInSeconds() },
      }),
      inject: [EnvConfigService],
    }),
  ],
  providers: [AuthService],
})
export class AuthModule {}
