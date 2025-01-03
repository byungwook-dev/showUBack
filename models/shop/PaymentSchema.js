import { model, Schema } from "mongoose";
import { getCurrentTime } from "../../utils/utils..js";

const paymentSchema = new Schema({
  
  // 결제 상품 정보
  productName: [
    { type: Schema.Types.ObjectId, ref: 'Md', required: true }, // MD 상품명
    { type: Schema.Types.ObjectId, ref: 'Auction', required: true }, // 경매 상품명
  ],
  price: { type: Schema.Types.ObjectId, ref: 'Md', required: true }, // MD 가격
  finalPrice: { type: Schema.Types.ObjectId, ref: 'Auction', required: true }, // 경매 가격
  option: { type: Schema.Types.ObjectId, ref: 'Md' }, // MD 옵션
  quantity: { type: Schema.Types.ObjectId, ref: 'Md', required: true, default: 1 }, // MD 수량
  image: [
    { type: Schema.Types.ObjectId, ref: 'Md', required: true },
    { type: Schema.Types.ObjectId, ref: 'Auction', required: true },
  ],

  // 주문 정보
  name: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  address: { type: String, required: true },
  message: { type: String },

  totalAmount: [
    { type: Schema.Types.ObjectId, ref: 'Md', required: true }, // MD 결제 금액
    { type: Schema.Types.ObjectId, ref: 'Auction', required: true }, // 경매 결제 금액
  ], 
  deliveryFee: { type: Number, default: 3000 }, // 배송비
  discount: { type: Number, default: 0 }, // 할인
  paymentMethod: { type: String, enum: ['신용/체크카드', '무통장입금', '네이버페이', '카카오페이', '토스페이'], required: true },
  status: { type: String, enum: ['주문완료', '배송중', '배송완료', '환불 처리', '환불 완료'], default: '주문완료', required: true },
  paymentAt: { type: String, default: getCurrentTime}, // 결제시간
});

export default model("Payment", paymentSchema, "payment")