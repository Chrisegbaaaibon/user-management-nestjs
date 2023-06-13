import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Date } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
   @Prop({ required: true })
   name: string;
   
   @Prop({ required: true })
   email: string;
   
   @Prop({ required: true })
   phone: string;
   
   @Prop({ required: true })
   password: string;
   
   @Prop({ default: false })
   isVerified: boolean;
   
   @Prop({ required: true })
   isDeleted: boolean;
   
   @Prop({ required: true,  default: 'user', enum: ['user', 'admin'] })
   role: string;

   @Prop()
   resetPasswordToken: string;
}

export const UserSchema = SchemaFactory.createForClass(User);