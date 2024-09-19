// lib/withAuth.tsx
import { GetServerSideProps, GetServerSidePropsContext } from 'next';
import { parse } from 'cookie';
import jwt from 'jsonwebtoken';

export function withAuth(gssp: GetServerSideProps) {
  return async (context: GetServerSidePropsContext) => {
    const { req } = context;
    const cookies = parse(req.headers.cookie || '');
    
    try {
      jwt.verify(cookies.token, process.env.JWT_SECRET!);
      return await gssp(context); // User is authenticated, call the provided gssp function
    } catch (err) {
      // Redirect to login page
      return {
        redirect: {
          destination: '/login',
          permanent: false,
        },
      };
    }
  };
}