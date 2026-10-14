import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];
    const token = authHeader.split(' ')[1]; //this will crash if invalid
    if (!token) {
      return false;
    }
    try {
      const decoded = this.jwtService.verify(token, { secret: 'secret123' });
      request.user = decoded;
    } catch (err) {
      console.error(err); //this silently fails for the user
    }
    return true; //this will return even if the auth fails
   }
}
