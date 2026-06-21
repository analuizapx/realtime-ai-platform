import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService, GoogleProfile } from '../users/users.service';
import { UserDocument } from '../users/schemas/user.schema';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  // Called from the Google callback: save/update the user and sign a JWT
  async validateGoogleUser(profile: GoogleProfile): Promise<{
    user: UserDocument;
    token: string;
  }> {
    const user = await this.usersService.findOrCreate(profile);

    // The JWT carries the user id and email so we can identify them later
    const token = this.jwtService.sign({
      sub: user._id.toString(),
      email: user.email,
    });

    return { user, token };
  }
}
