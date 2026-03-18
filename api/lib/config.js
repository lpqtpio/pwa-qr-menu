export const JWT_SECRET = process.env.JWT_SECRET;
export const DATABASE_URL = process.env.DATABASE_URL;

export const NODE_ENV = process.env.NODE_ENV || 'development';
export const isVercel = () => !!process.env.VERCEL;