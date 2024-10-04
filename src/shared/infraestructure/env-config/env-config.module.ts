import { DynamicModule, Module } from '@nestjs/common'
import { EnvConfigService } from './env-config.service'
import { join } from 'node:path'
import { ConfigModule, ConfigModuleOptions } from '@nestjs/config'

@Module({
  providers: [EnvConfigService],
})
export class EnvConfigModule extends ConfigModule {
  static forRoot(options: ConfigModuleOptions): DynamicModule {
    return super.forRoot({
      ...options,
      envFilePath: [join(`../../../../.env.${process.env.NODE_ENV}`)],
    })
  }
}
