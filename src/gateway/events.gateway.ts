import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*', // Cho frontend truy cập
  },
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: any) {
    console.log('Client connected:', client.id);
  }

  handleDisconnect(client: any) {
    console.log('Client disconnected:', client.id);
  }

  /**
   * 🔥 Emit khi có booking mới tạo (create)
   */
  emitNewBooking(booking: any) {
    console.log('🔥 Emit: new_booking', booking.bookingId);
    this.server.emit('new_booking', booking);
  }

  /**
   * 🔥 Emit khi trạng thái booking thay đổi (confirmed/canceled)
   */
  emitBookingStatusChanged(data: { bookingId: number; status: string }) {
    console.log('🔥 Emit: booking_status_changed', data);
    this.server.emit('booking_status_changed', data);
  }

  /**
   * 🔥 Emit dùng chung để refresh dashboard (nếu cần)
   */
  emitDashboardUpdate() {
    console.log('🔥 Emit: dashboard_update');
    this.server.emit('dashboard_update');
  }
}
