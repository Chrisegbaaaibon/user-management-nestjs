import { IsEmail, IsNotEmpty } from "class-validator";

export class UserDto {
      @IsEmail()
      email: string;
   
      @IsNotEmpty()
      readonly password: string;
   
      @IsNotEmpty()
      name: string;
   
      phone: string;
   
      role: string;
}