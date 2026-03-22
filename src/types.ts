export type UserRole = 'patient' | 'rider' | 'admin' | 'pharmacy';

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  phone?: string;
  address?: string;
  zone?: string;
  role: UserRole;
  isBoarded: boolean;
  isAvailable?: boolean;
  createdAt: string;
}

export type OrderStatus = 'pending' | 'assigned' | 'picked-up' | 'in-transit' | 'delivered' | 'cancelled';

export interface Order {
  id?: string;
  patientId: string;
  patientName?: string;
  patientPhone?: string;
  medicationName: string;
  quantity: string;
  pharmacyId?: string;
  pharmacyName: string;
  pharmacyAddress?: string;
  deliveryAddress: string;
  deliveryZone: string;
  prescriptionDetails?: string;
  status: OrderStatus;
  riderId?: string;
  riderName?: string;
  paymentStatus?: 'unpaid' | 'paid' | 'failed';
  consentGiven: boolean;
  createdAt: string;
  updatedAt: string;
}

export type PharmacyStatus = 'pending' | 'active' | 'inactive';

export interface Pharmacy {
  id?: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  status: PharmacyStatus;
}

export interface Zone {
  id?: string;
  name: string;
  description?: string;
  riderCapacity: number;
}

export interface RiderLocation {
  riderId: string;
  latitude: number;
  longitude: number;
  updatedAt: string;
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string;
    email?: string;
    emailVerified?: boolean;
    isAnonymous?: boolean;
    tenantId?: string | null;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}
