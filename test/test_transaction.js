// getTransactions.js

// 1. Import thư viện axios
const axios = require('axios');

// 2. Định nghĩa hàm async để thực hiện API call
const fetchSepayTransactions = async () => {
    // Dữ liệu cấu hình cho API call
    const SEPAY_API_URL = 'https://my.sepay.vn/userapi/transactions/list?account_number=5601999291&limit=20';
    // Lưu ý: Trong thực tế, bạn nên dùng biến môi trường (process.env.MY_TOKEN)
    // để bảo mật Token, nhưng ở đây ta dùng hardcoded token như trong yêu cầu.
    const BEARER_TOKEN = '5FVZTNIC4T68JWQGNJGXLMVSQWBRBFHMM0NROYS8CUK4FI99ASQU01VRVMD2GDFE';

    try {
        console.log(`Đang gửi yêu cầu GET đến: ${SEPAY_API_URL}`);

        // Thực hiện API call bằng axios.get
        const resp = await axios.get(SEPAY_API_URL, {
            timeout: 5000, // Thời gian chờ tối đa 5 giây
            headers: {
                // Header chuẩn cho nội dung JSON
                'Content-Type': 'application/json',
                // Header xác thực Bearer Token
                'Authorization': `Bearer ${BEARER_TOKEN}`,
            },
        });

        // 3. Xử lý phản hồi thành công
        console.log('\n--- PHẢN HỒI THÀNH CÔNG ---');
        console.log('Status Code:', resp.status); // Ví dụ: 200
        console.log('Dữ liệu (data):');
        // In ra dữ liệu thực tế mà API trả về
        console.log(resp.data);

    } catch (error) {
        // 4. Xử lý lỗi (lỗi mạng, lỗi timeout, lỗi API 4xx/5xx)
        console.error('\n--- LỖI KHI GỌI API SEPAY ---');

        if (error.response) {
            // Lỗi từ server (status code 4xx hoặc 5xx)
            console.error('Status:', error.response.status);
            console.error('Data Lỗi:', error.response.data);
        } else if (error.request) {
            // Không nhận được phản hồi (ví dụ: network issue, timeout)
            console.error('Không nhận được phản hồi từ server. Request:', error.request);
        } else {
            // Các lỗi khác
            console.error('Lỗi:', error.message);
        }
    }
};

// Chạy hàm chính
fetchSepayTransactions();