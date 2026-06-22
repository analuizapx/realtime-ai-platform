import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { GoogleProfile, UsersService } from '../users/users.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly config: ConfigService,
  ) {}

  // Step 1: redirects the user to Google's login page (handled by the guard)
  @Get('google')
  @UseGuards(GoogleAuthGuard)
  googleLogin() {
    // Intentionally empty: the guard performs the redirect
  }

  // Step 2: Google redirects back here after the user authorizes
  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleCallback(@Req() req: Request, @Res() res: Response) {
    // The GoogleStrategy put the mapped profile on req.user
    const profile = req.user as GoogleProfile;
    const { token } = await this.authService.validateGoogleUser(profile);

    // In production the frontend and backend live on different domains, so the
    // cookie must be SameSite=None + Secure for the browser to send it.
    const isProd = process.env.NODE_ENV === 'production';

    // Store the JWT in an httpOnly cookie (not readable by browser JS)
    res.cookie('access_token', token, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Send the user back to the frontend, now logged in
    return res.redirect(this.config.get<string>('FRONTEND_URL')!);
  }

  // Returns the currently logged-in user (protected by JWT)
  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@Req() req: Request) {
    const { userId } = req.user as { userId: string };
    return this.usersService.findById(userId);
  }

  // Clears the auth cookie
  @Get('logout')
  logout(@Res() res: Response) {
    res.clearCookie('access_token');
    return res.json({ message: 'Logged out' });
  }
}
