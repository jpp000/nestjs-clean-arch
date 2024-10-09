import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { EnvConfigModule } from './shared/infraestructure/env-config/env-config.module'
import { UsersModule } from './users/infrastructure/users.module'
import { DatabaseModule } from './shared/infraestructure/database/database.module'

@Module({
  imports: [EnvConfigModule, UsersModule, DatabaseModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
