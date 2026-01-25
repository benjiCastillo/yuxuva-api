declare global {
  namespace Express {
    interface User {
      id: string;
      roles: string[];
      email?: string | null;
    }

    interface Request {
      user?: User;
    }
  }
}

export {};
