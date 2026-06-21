import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';

// Shape of the data we receive from Google after login
export interface GoogleProfile {
  googleId: string;
  email: string;
  name: string;
  picture: string;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  // Create the user on first login, or update their data on returning logins
  async findOrCreate(profile: GoogleProfile): Promise<UserDocument> {
    return this.userModel.findOneAndUpdate(
      { googleId: profile.googleId },
      { $set: profile },
      { new: true, upsert: true },
    );
  }

  // List every registered user (for the "users" menu)
  async findAll(): Promise<UserDocument[]> {
    return this.userModel.find().sort({ createdAt: -1 }).exec();
  }

  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).exec();
  }
}
