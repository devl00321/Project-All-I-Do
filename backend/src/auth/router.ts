/**
 * router.ts
 * Express router for /auth endpoints.
 *
 * Mounted in index.js as:
 *   app.use('/auth', authRouter)
 *
 * Routes:
 *   POST /auth/otp/request  — send OTP to phone
 *   POST /auth/otp/verify   — verify OTP, receive tokens
 *   POST /auth/refresh      — rotate refresh token
 */

import { Router } from 'express';
import { otpRequestHandler } from './otp-request.handler';
import { otpVerifyHandler }  from './otp-verify.handler';
import { refreshHandler }    from './refresh.handler';

export const authRouter = Router();

authRouter.post('/otp/request', otpRequestHandler);
authRouter.post('/otp/verify',  otpVerifyHandler);
authRouter.post('/refresh',     refreshHandler);
