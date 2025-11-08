import { JwtService } from '@nestjs/jwt';

export function generateTokens(jwtService: JwtService, payload: any) {
  const access_token = jwtService.sign(payload, {
    secret: process.env.JWT_ACCESS_SECRET,
    expiresIn: '15m',
  });

  const refresh_token = jwtService.sign(payload, {
    secret: process.env.JWT_REFRESH_SECRET,
    expiresIn: '7d',
  });

  return { access_token, refresh_token }
}
