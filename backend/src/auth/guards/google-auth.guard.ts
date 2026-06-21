import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// Triggers the Google OAuth login flow
@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {}
