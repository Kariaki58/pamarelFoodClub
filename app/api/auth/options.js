import CredentialsProvider from 'next-auth/providers/credentials';
import User from '@/models/user';
import dbConnect from '@/lib/dbConnect';
import bcrypt from 'bcryptjs';


export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials, req) {
        try {
          await dbConnect();
          
          // 1. Find user by email
          const user = await User.findOne({ email: credentials.email }).select('+password +isActive');
          console.log({user})
          if (!user) {
            throw new Error('No user found with this email address');
          }

          // 2. Check if account is active
          if (!user.isActive) {
            throw new Error('Your account has been deactivated. Please contact support.');
          }

          // 3. Verify password
          console.log("#########")
          console.log(credentials.password)
          console.log("#########")

          const isValid = await bcrypt.compare(credentials.password, user.password);
          if (!isValid) {
            throw new Error('Incorrect password');
          }

          // 4. Return user object if everything is valid
          return {
            id: user._id.toString(),
            name: `${user.firstName} ${user.lastName}`,
            email: user.email,
            role: user.role
          };

        } catch (error) {
          // Throw specific error messages to the client
          throw new Error(error.message || 'Authentication failed');
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.role = token.role;
      session.user.id = token.id;
      return session;
    }
  },
  pages: {
    signIn: '/login',
    error: '/login'
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60 // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development'
};