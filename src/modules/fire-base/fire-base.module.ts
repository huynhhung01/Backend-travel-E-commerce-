import { Module } from '@nestjs/common';
import { FireBaseService } from './fire-base.service';
import { FireBaseController } from './fire-base.controller';
import { FcmModule } from '../fcm/fcm.module';

@Module({
  imports: [
    FcmModule
  ],
  controllers: [FireBaseController],
  providers: [FireBaseService],
  exports: [FireBaseService],
})
export class FireBaseModule { }
