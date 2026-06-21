import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  // Google account unique id (used to find returning users)
  @Prop({ required: true, unique: true })
  googleId: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  name: string;

  // URL of the user's Google profile picture
  @Prop()
  picture: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
