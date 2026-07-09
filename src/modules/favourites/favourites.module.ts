import { Module } from '@nestjs/common';
import { FavouritesService } from './favourites.service';
import { FavouritesController } from './favourites.controller';
import { ToursModule } from '../tours/tours.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '../user/user.module';
import { FavouriteEntity } from './entities/favourite.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([FavouriteEntity]),
    UserModule,
    ToursModule
  ],
  controllers: [FavouritesController],
  providers: [FavouritesService],
  exports: [FavouritesService]
})
export class FavouritesModule { }
