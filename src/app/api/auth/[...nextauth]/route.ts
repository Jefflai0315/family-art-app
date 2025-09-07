import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  adapter: MongoDBAdapter(clientPromise),
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user, account }) {
      // Persist user data to token
      if (user) {
        token.userId = user.id;
        token.credits = user.credits || 0; // Default 0 credits for new users
      }
      return token;
    },
    async session({ session, token }) {
      // Send properties to the client
      if (token) {
        session.user.id = token.userId as string;

        // Fetch latest credits from database
        try {
          const client = await clientPromise;
          const db = client.db("bazgym");
          const usersCollection = db.collection("users");
          const user = await usersCollection.findOne({
            email: token.email,
          });
          session.user.credits = user?.credits || 0;
        } catch (error) {
          console.error("Error fetching user credits:", error);
          session.user.credits = token.credits as number;
        }
      }
      return session;
    },
    async signIn({ user, account, profile }) {
      // Check if user exists in database, if not create with default credits
      if (account?.provider === "google") {
        try {
          const client = await clientPromise;
          const db = client.db("bazgym");
          const usersCollection = db.collection("users");

          const existingUser = await usersCollection.findOne({
            email: user.email,
          });

          if (!existingUser) {
            // Create new user with default credits
            await usersCollection.insertOne({
              email: user.email,
              name: user.name,
              image: user.image,
              credits: 0, // Default credits for new users
              createdAt: new Date(),
              updatedAt: new Date(),
            });
            console.log(`New user created: ${user.email} with 0 credits`);
          }
        } catch (error) {
          console.error("Error creating/finding user:", error);
        }
      }
      return true;
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
});

export { handler as GET, handler as POST };
