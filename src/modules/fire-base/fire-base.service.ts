import { Injectable, OnModuleInit } from '@nestjs/common';
import { CreateFireBaseDto } from './dto/create-fire-base.dto';
import { UpdateFireBaseDto } from './dto/update-fire-base.dto';
import * as admin from 'firebase-admin';
import { ServiceAccount } from 'firebase-admin';
import { FcmService } from '../fcm/fcm.service';
import path from 'path';

@Injectable()
export class FireBaseService implements OnModuleInit {
  onModuleInit() {
    console.log('FireBaseService has been initialized.');
    // You can add any initialization logic here, such as setting up connections.
    const SERVICE_ACCOUNT_FILE = 'facebook-clone-174bf-7dd22f0a0124.json';

    // Xử lý đường dẫn
    // Giả định tệp JSON nằm ở thư mục gốc của dự án
    const serviceAccount = path.join(
      __dirname, 
      '..', // Thoát khỏi dist/modules/fire-base
      '..', // Thoát khỏi dist/modules
      '..', // Thoát khỏi dist
      SERVICE_ACCOUNT_FILE
    );
    // Initialize Firebase Admin SDK here if needed
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    }
  }

  constructor(
    private fcmService: FcmService,
  ) {

  }

  async sendToAllDevices(title: string, body: string): Promise<any> {
    const topic = 'all_devices'; // Topic chung cho tất cả
    const message: admin.messaging.Message = {
      notification: {
        title: title,
        body: body,
      },
      // Bạn có thể thêm data hoặc cấu hình khác (android, apns)
      topic: topic,
    };

    try {
      const response = await admin.messaging().send(message);
      console.log('Successfully sent message to topic:', response);
      return { success: true, response };
    } catch (error) {
      console.error('Error sending message to topic:', error);
      return { success: false, error };
    }
  }

  async sendToSpecificToken(token: string, title: string, body: string): Promise<any> {
    const message: admin.messaging.Message = {
      notification: {
        title: title,
        body: body,
      },
      token: token, // Sử dụng token duy nhất
    };

    try {
      const response = await admin.messaging().send(message);
      console.log('Successfully sent message to token:', response);
      return { success: true, response };
    } catch (error) {
      console.error('Error sending message to token:', error);
      return { success: false, error };
    }
  }

  async sendToSpecificTokenUser(IdUser: number, title: string, body: string): Promise<any> {

    // Lấy token FCM từ database dựa trên IdUser
    const tokens = await this.fcmService.getTokensByUserId(IdUser);
    if (tokens.length === 0) {
      console.log('No FCM tokens found for user:', IdUser);
      return { success: false, message: 'No FCM tokens found for user' };
    }
    // Gửi thông báo đến từng token
    for (const token of tokens) {
      await this.sendToSpecificToken(token, title, body);
    }
    return { success: true, message: 'Notifications sent to user tokens' };
  }


}
