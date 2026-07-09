import { Injectable } from '@nestjs/common';

@Injectable()
export class StringNormalizerService {

  private readonly ACCENT_MAP = {
    'a': 'aáàảãạăắằẳẵặâấầẩẫậ',
    'e': 'eéèẻẽẹêếềểễệ',
    'i': 'iíìỉĩị',
    'o': 'oóòỏõọôốồổỗộơớờởỡợ',
    'u': 'uúùủũụưứừửữự',
    'y': 'yýỳỷỹỵ',
    'd': 'dđ', // Xử lý chữ Đ
    'A': 'AÁÀẢÃẠĂẮẰẲẴẶÂẤẦẨẪẬ',
    'E': 'EÉÈẺẼẸÊẾỀỂỄỆ',
    'I': 'IÍÌỈĨỊ',
    'O': 'OÓÒỎÕỌÔỐỒỔỖỘƠỚỜỞỠỢ',
    'U': 'UÚÙỦŨỤƯỨỪỬỮỰ',
    'Y': 'YÝỲỶỸỴ',
    'D': 'DĐ'
  };

  public normalize(text: string): string {
    if (!text) {
      return '';
    }
    let normalizedText = text;
    for (const base in this.ACCENT_MAP) {
      const chars = this.ACCENT_MAP[base];
      for (let i = 0; i < chars.length; i++) {
        const regex = new RegExp(chars[i], 'g');
        normalizedText = normalizedText.replace(regex, base[0]);
      }
    }

    // 2. Chuyển thành chữ thường (toLowerCase)
    // Lưu ý: Việc loại bỏ dấu ở bước 1 đã xử lý hầu hết chữ hoa/thường,
    // nhưng ta vẫn gọi toLowerCase() để đảm bảo tất cả ký tự còn lại là chữ thường.
    normalizedText = normalizedText.toLowerCase();

    // 3. Loại bỏ khoảng trắng (replace(/\s/g, ''))
    // Loại bỏ tất cả khoảng trắng, tab, xuống dòng (\s)
    normalizedText = normalizedText.replace(/\s/g, '');

    // Nếu bạn muốn loại bỏ luôn các ký tự đặc biệt khác (ví dụ: ( ) - . ,)
    // hãy sử dụng dòng code sau thay vì chỉ loại bỏ khoảng trắng:
    // normalizedText = normalizedText.replace(/[^a-z0-9]/g, ''); 
    // Tuy nhiên, theo yêu cầu, ta chỉ loại bỏ khoảng trắng.

    return normalizedText;
  }
}

// --- Ví dụ minh họa cách sử dụng trong môi trường TypeScript/Node.js ---

// Để chạy ví dụ này, bạn cần tạo một instance của Service (điều mà NestJS IoC Container sẽ làm tự động).
// Tuy nhiên, trong môi trường file đơn, chúng ta có thể tạo thủ công.
// const normalizer = new StringNormalizerService();

// const input_string_1 = "Nguyễn Văn A";
// console.log(`Chuỗi đầu vào 1: '${input_string_1}'`);
// console.log(`Chuỗi đầu ra 1:   '${normalizer.normalize(input_string_1)}'`); 
// // Kết quả: 'nguyenvana'

// const input_string_2 = "Bài Viết Quan Trọng (2025)";
// console.log(`\nChuỗi đầu vào 2: '${input_string_2}'`);
// console.log(`Chuỗi đầu ra 2:   '${normalizer.normalize(input_string_2)}'`);
// // Kết quả: 'baivietquantrong(2025)'
