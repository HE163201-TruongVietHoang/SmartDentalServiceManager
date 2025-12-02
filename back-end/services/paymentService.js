

const crypto = require('crypto');
const querystring = require('qs');
const moment = require('moment');
const { create: createPayment, findOneAndUpdate: updatePayment, getAll, getByUserId } = require('../access/paymentAccess');
const { confirmPayment } = require('../access/invoiceAccess');

class PaymentService {

    async createPaymentUrl(req) {
        try {
            const appointmentId = req.body.appointmentId;
            const amount = req.body.amount || 0; // Số tiền thanh toán cho appointment
            const invoiceId = req.body.invoiceId || null; // Nếu có invoice
            const ipAddr = req.headers['x-forwarded-for'] ||
                req.connection.remoteAddress ||
                req.socket.remoteAddress ||
                req.connection.socket.remoteAddress;

            // Tạo Payment record với status Pending
            const payment = await createPayment({
                invoiceId,
                paymentMethod: 'VNPay',
                amount,
                transactionCode: null, // Sẽ cập nhật sau
                status: 'Pending',
                paymentDate: null,
                note: `Payment for appointment ${appointmentId}`
            });

            const paymentId = payment.paymentId;

            const tmnCode = process.env.VNP_TMN_CODE;
            const secretKey = process.env.VNP_HASH_SECRET;
            let vnpUrl = process.env.VNP_URL;
            const returnUrl = process.env.VNP_RETURN_URL;
//   console.log("tmnCode:", tmnCode);
//         console.log("secretKey:", secretKey);
//         console.log("vnpUrl:", vnpUrl);
            const date = new Date();
            const createDate = moment(date).format("YYYYMMDDHHmmss");
            const orderId = paymentId; // Sử dụng paymentId làm transaction ref
            const orderInfo = `Appointment payment`;
            const orderType = 'other';
            const locale = 'vn';
            const currCode = 'VND';
            const bankCode = req.body.bankCode || ''; // Ngân hàng thanh toán
            let vnp_Params = {
                'vnp_Version': '2.1.0',
                'vnp_Command': 'pay',
                'vnp_TmnCode': tmnCode,
                'vnp_Locale': locale,
                'vnp_CurrCode': currCode,
                'vnp_TxnRef': orderId.toString(),
                'vnp_OrderInfo': orderInfo,
                'vnp_OrderType': orderType,
                'vnp_Amount': amount * 100,
                'vnp_ReturnUrl': returnUrl,
                'vnp_IpAddr': ipAddr,
                'vnp_CreateDate': createDate,
            };
            if (bankCode !== null && bankCode !== '') {
                vnp_Params['vnp_BankCode'] = bankCode;
            }
            vnp_Params = this.sortObject(vnp_Params);

            // console.log('vnp_Params after sort:', vnp_Params);
            const signData = querystring.stringify(vnp_Params, { encode: false });
            // console.log('signData:', signData);
            const hmac = crypto.createHmac("sha512", secretKey);
            const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");
            vnp_Params['vnp_SecureHash'] = signed;
            vnpUrl += '?' + querystring.stringify(vnp_Params, { encode: false });
            // console.log('vnpUrl:', vnpUrl);

            return { vnpUrl, paymentId };
        } catch (error) {
            console.error('Error creating payment URL:', error);
            throw new Error('Internal Server Error');
        }
    }   
     async handleVnpayReturnUrl(req) {
        try {
            // const responseData = req.query;
            const responseData = JSON.parse(JSON.stringify(req.query));
            console.log('responseData:', responseData, typeof responseData);
            const secureHash = responseData.vnp_SecureHash;
            delete responseData.vnp_SecureHash;
            delete responseData.vnp_SecureHashType;

            const secretKey = process.env.VNP_HASH_SECRET;
            const sortedData = this.sortObject(responseData);
            const signData = querystring.stringify(sortedData, { encode: false });
            const hmac = crypto.createHmac("sha512", secretKey);
            const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");

            if (secureHash !== signed) {
                throw new Error('Checksum validation failed');
            }

            const paymentId = responseData.vnp_TxnRef;

            const updatedPayment = await updatePayment(paymentId, {
                status: responseData.vnp_ResponseCode === '00' ? 'Success' : 'Failed',
                paymentDate: new Date(),
                transactionCode: responseData.vnp_TransactionNo
            });

            // Nếu thanh toán thành công và có invoiceId, cập nhật trạng thái invoice
            if (responseData.vnp_ResponseCode === '00' && updatedPayment.invoiceId) {
                await confirmPayment(updatedPayment.invoiceId);
            }

            return responseData.vnp_ResponseCode === '00' ? 'Payment successful' : 'Payment failed';
        } catch (error) {
            console.error('Error updating payment:', error);
            throw new Error('Internal Server Error');
        }
    }

    async getAllPayments() {
        try {
            return await getAll();
        } catch (error) {
            console.error('Error getting all payments:', error);
            throw new Error('Internal Server Error');
        }
    }

    async getPaymentsByUserId(userId) {
        try {
            return await getByUserId(userId);
        } catch (error) {
            console.error('Error getting payments by user ID:', error);
            throw new Error('Internal Server Error');
        }
    }


      sortObject(obj) {
        let sorted = {};
        let str = [];
        for (let key in obj) {
            if (obj.hasOwnProperty(key)) {
                str.push(encodeURIComponent(key));
            }
        }
        str.sort();
        for (let key = 0; key < str.length; key++) {
            sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
        }
        return sorted;
    }
}

module.exports = new PaymentService();