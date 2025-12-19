
export enum UserRole {
  ADMIN = 'admin',
  AFILIADO = 'afiliado',
  CLIENTE = 'cliente'
}

export interface UserProfile {
  uid: string;
  nome: string;
  email: string;
  tipo: UserRole;
  status: 'ativo' | 'inativo';
  criadoEm: any;
}

export interface Product {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  estoque: number;
  tamanhos: string[];
  cores: string[];
  imagens: string[];
  ativo: boolean;
  categoria: string;
  criadoEm: any;
}

export interface CartItem extends Product {
  quantity: number;
  selectedSize: string;
  selectedColor: string;
}

export interface Order {
  id: string;
  userId: string;
  produtos: CartItem[];
  valorTotal: number;
  statusPagamento: 'pendente' | 'pago' | 'cancelado';
  statusPedido: 'processando' | 'enviado' | 'entregue';
  afiliadoId?: string;
  criadoEm: any;
}

export interface Affiliate {
  userId: string;
  nome: string;
  codigoReferencia: string;
  percentualComissao: number;
  saldo: number;
  totalVendas: number;
  totalCliques: number;
}

export interface Commission {
  id?: string;
  orderId: string;
  afiliadoId: string;
  valor: number;
  status: 'pendente' | 'pago';
  criadoEm: any;
}

export interface Category {
  id: string;
  nome: string;
  ativa: boolean;
}
