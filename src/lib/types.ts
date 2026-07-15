export type ProductCategory =
  | "當季水果"
  | "進口水果"
  | "禮盒組合"
  | "學校團膳"
  | "公司訂購";

export type StockStatus = "有貨" | "少量" | "售完" | "預購";

export type Product = {
  id: string;
  name: string;
  category: ProductCategory;
  description: string;
  spec: string;
  unit: string;
  price: number;
  stockStatus: StockStatus;
  imageUrl: string;
  sortOrder: number;
  notionTitle?: string;
  notionContent?: string;
  sourceStatus?: "啟用" | "停用";
  freshnessNote?: string;
};

export type KnowledgeEntry = {
  id: string;
  title: string;
  category:
    | "商品"
    | "FAQ訂購"
    | "FAQ配送"
    | "FAQ付款"
    | "FAQ退換貨"
    | "FAQ一般"
    | "貼圖";
  status: "啟用" | "停用";
  content: string;
};

export type CartItem = {
  productId: string;
  quantity: number;
};

export type OrderStatus =
  | "已建立"
  | "已確認"
  | "備貨中"
  | "配送中"
  | "已完成"
  | "已取消";

export type OrderItem = {
  productId: string;
  name: string;
  spec: string;
  unit: string;
  price: number;
  quantity: number;
};

export type Order = {
  orderId: string;
  customerName: string;
  lineUserId: string;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  totalAmount: number;
  paymentMethod: "現場付款" | "月結" | "匯款";
  receiverName: string;
  phone: string;
  deliveryAddress: string;
  deliveryDate: string;
  deliveryTimeSlot: "上午" | "下午" | "指定時間";
  notes: string;
  createdAt: string;
  updatedAt: string;
};

export type Customer = {
  name: string;
  lineUserId: string;
  type: "學校" | "政府" | "公司" | "個人";
  contactPerson: string;
  phone: string;
  address: string;
  taxId: string;
  favoriteProducts: string;
  notes: string;
};

export type DeliveryArea = "台中市區" | "屯區" | "海線" | "山線" | "外縣市";

export type DeliveryRule = {
  id: string;
  name: string;
  area: DeliveryArea;
  districts: string[];
  freeShippingThreshold: number;
  deliveryFee: number;
  minOrderAmount: number;
  isActive: boolean;
  notes: string;
  sortOrder: number;
};

export type SupportRequest = {
  requestId: string;
  lineUserId: string;
  customerName: string;
  contactPerson: string;
  phone: string;
  topic: "訂單問題" | "商品報價" | "配送安排" | "帳款月結" | "其他";
  urgency: "一般" | "今天需回覆" | "急件";
  relatedOrderId: string;
  message: string;
  status: "新工單" | "已受理" | "處理中" | "待客戶確認" | "已完成";
  createdAt: string;
};
