import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { ConfigModule } from '@nestjs/config';

@Module({
    imports: [
        ConfigModule,
        MailerModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: async () => ({
                transport: {
                    host: process.env.MAIL_HOST || "smtp.gmail.com",
                    port: parseInt(process.env.MAIL_PORT || '587'),
                    secure: false,
                    auth: {
                        user: process.env.MAIL_USER || '',
                        pass: process.env.MAIL_PASS || '',
                    },
                },
                defaults: {
                    from: process.env.MAIL_FROM || 'no-reply@example.com',
                },
            }),
        }),
    ],
    providers: [MailService],
    exports: [MailService],
})
export class MailModule { }
