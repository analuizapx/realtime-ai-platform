import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// Protects routes: only requests with a valid JWT cookie pass through
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
