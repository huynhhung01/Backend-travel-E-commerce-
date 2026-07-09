import { Module } from '@nestjs/common';
import { RefreshTokensService } from './refresh_tokens.service';
import { RefreshTokensController } from './refresh_tokens.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RefreshTokenEntity } from './entities/refresh_token.entity';

import { UserModule } from '../user/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([RefreshTokenEntity]), UserModule],
  controllers: [RefreshTokensController],
  providers: [RefreshTokensService],
  exports: [RefreshTokensService],
})
export class RefreshTokensModule { }
