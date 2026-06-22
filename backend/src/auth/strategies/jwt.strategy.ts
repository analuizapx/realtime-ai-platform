import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';

// Payload we store inside the JWT when the user logs in
export interface JwtPayload {
  sub: string; // user id in our database
  email: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(config: ConfigService) {
    super({
      // Accept the token from the "access_token" cookie OR the Authorization
      // header. The header path is used in production, where the frontend and
      // backend are on different sites and third-party cookies get blocked.
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => req?.cookies?.access_token,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      // "!" tells TypeScript this value is always defined (it comes from .env)
      secretOrKey: config.get<string>('JWT_SECRET')!,
    });
  }

  // Whatever we return here becomes request.user on protected routes
  validate(payload: JwtPayload) {
    return { userId: payload.sub, email: payload.email };
  }
}
