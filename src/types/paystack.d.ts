declare module 'paystack' {
  export default class Paystack {
    constructor(secretKey: string);

    transaction: {
      initialize(data: any): Promise<any>;
      verify(reference: string): Promise<any>;
      list?(params?: any): Promise<any>;
    };

    customer?: {
      create(data: any): Promise<any>;
      get(email: string): Promise<any>;
    };

    plan?: {
      create(data: any): Promise<any>;
      list(): Promise<any>;
    };
  }
}
