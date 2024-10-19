import { Module } from '@nestjs/common'
import { AuthService } from './auth.service'
import { EnvConfigModule } from '@/shared/infraestructure/env-config/env-config.module'
import { JwtModule, JwtService } from '@nestjs/jwt'
import { EnvConfigService } from '@/shared/infraestructure/env-config/env-config.service'

@Module({
  imports: [
    EnvConfigModule,
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
  exports: [AuthService],
})
export class AuthModule {}
