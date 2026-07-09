import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { AppController } from './app.controller';
import { AppService } from './app.service';
// import { UsersModule } from './modules/users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Check, DataSource } from 'typeorm';
// import { UserEntity } from './modules/users/entities/users.entity';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { ToursModule } from './modules/tours/tours.module';
import { CouponsModule } from './modules/coupons/coupons.module';
import { PromotionsModule } from './modules/promotions/promotions.module';
import { ImagesModule } from './modules/images/images.module';
import { TimelinesModule } from './modules/timelines/timelines.module';
import { StartEndDatesModule } from './modules/start_end_dates/start_end_dates.module';
import { BookingsModule } from './modules/bookings/bookings.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { FavouritesModule } from './modules/favourites/favourites.module';
import { CheckoutsModule } from './modules/checkouts/checkouts.module';
import { InvoicesModule } from './modules/invoices/invoices.module';
import { TourPromotionsModule } from './modules/tour_promotions/tour_promotions.module';
import { UserEntity } from './modules/user/entities/user.entity';
import { BookingEntity } from './modules/bookings/entities/booking.entity';
import { CheckoutEntity } from './modules/checkouts/entities/checkout.entity';
import { RefreshTokensModule } from './modules/refresh_tokens/refresh_tokens.module';
import { MailModule } from './modules/mail/mail.module';
import { RedisModule } from './modules/redis/redis.module';
import { HashtagsModule } from './modules/hashtags/hashtags.module';
import { TourHashtagsModule } from './modules/tour_hashtags/tour_hashtags.module';
import { TransactionsModule } from './modules/transactions/transactions.module';
import { AccountsModule } from './modules/accounts/accounts.module';
import { TransactionsCoinsModule } from './modules/transactions-coins/transactions-coins.module';
import { FireBaseModule } from './modules/fire-base/fire-base.module';
import { FcmModule } from './modules/fcm/fcm.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { EventsModule } from './gateway/events.module';
@Module({
  imports: [
    // TypeOrmModule.forRoot({
    //   type: 'mysql',
    //   host: 'localhost',
    //   port: 3306,
    //   username: 'root',
    //   password: '',
    //   database: 'databases_pbl6',
    //   // entities: [UserEntity],
    //   autoLoadEntities: true,
    //   synchronize: true,
    // }),



    TypeOrmModule.forRoot({
      type: 'mysql',
      host: '',
      port: 4000,
      username: '',
      password: '',
      database: 'test',
      // entities: [UserEntity],
      autoLoadEntities: true,
      synchronize: false,
      // === PHẦN CẦN THIẾT ĐỂ KẾT NỐI AN TOÀN ===
      ssl: {
        // Bắt buộc sử dụng SSL/TLS
        rejectUnauthorized: true,
        // Nếu bạn gặp lỗi, thử thêm thuộc tính 'ca'
        // hoặc sử dụng 'ca' để trỏ đến file chứng chỉ CA của TiDB nếu được yêu cầu.
        // Ví dụ: ca: fs.readFileSync('path/to/tidb_ca.pem').toString(),
      },
      extra: {
        // Cấu hình này giúp duy trì kết nối ổn định hơn
        connectionLimit: 10,
        connectTimeout: 10000,
      },
      // ==========================================
    }),

    BullModule.forRoot({
      // Dùng Redis làm backend cho Bull queue
      redis: {
        host: process.env.REDIS_HOST || '',
        port: Number(process.env.REDIS_PORT) || 15141,
        username: process.env.REDIS_USERNAME || '',
        password: process.env.REDIS_PASSWORD || '',
      },
    }),

    TypeOrmModule.forFeature([UserEntity, BookingEntity, CheckoutEntity]),
    // UsersModule,
    AuthModule,
    UserModule,
    ToursModule,
    CouponsModule,
    PromotionsModule,
    ImagesModule,
    TimelinesModule,
    StartEndDatesModule,
    BookingsModule,
    ReviewsModule,
    FavouritesModule,
    CheckoutsModule,
    InvoicesModule,
    TourPromotionsModule,
    RefreshTokensModule,
    MailModule,
    RedisModule,
    HashtagsModule,
    TourHashtagsModule,
    TransactionsModule,
    AccountsModule,
    TransactionsCoinsModule,
    FireBaseModule,
    FcmModule,
    NotificationsModule,
    EventsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  constructor(private dataSource: DataSource) { }
}
