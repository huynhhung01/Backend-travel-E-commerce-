import { Module } from '@nestjs/common';
import { HashtagsService } from './hashtags.service';
import { HashtagsController } from './hashtags.controller';
import { HashtagEntity } from './entities/hashtag.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([HashtagEntity])],
  controllers: [HashtagsController],
  providers: [HashtagsService],
  exports: [HashtagsService]
})
export class HashtagsModule { }
