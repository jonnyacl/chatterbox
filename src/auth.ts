import { getAuth, Auth } from 'firebase-admin/auth';
import { Request, Response, NextFunction } from 'express';

export const auth = async (token: string): Promise<boolean> => {
  const authorizer: Auth = getAuth();
  try {
    await authorizer.verifyIdToken(token);
    return true;
  } catch (e) {
    return false;
  }
};

export const useAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (req.headers.authorization) {
    const authorizer: Auth = getAuth();
    try {
      await authorizer.verifyIdToken(req.headers.authorization);
      next();
    } catch (e) {
      console.error('AUth err', e);
    }
  } else {
    console.error('No token sent');
    res.status(401).send();
  }
};
