import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      credits: number;
    };
  }

  interface User {
    id: string;
    credits?: number;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId: string;
    credits: number;
  }
}
