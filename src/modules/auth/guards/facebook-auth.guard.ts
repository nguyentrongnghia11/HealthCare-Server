import { CanActivate, ExecutionContext, UnauthorizedException } from "@nestjs/common";
import axios from "axios";



export class FacebookAuthGuads implements CanActivate {
    async canActivate(context: ExecutionContext): Promise<boolean> {

        const request: Request = context.switchToHttp().getRequest()
        const { accessToken } = request.body as any
        console.log("accessToken ", accessToken)

        if (!accessToken) {
            throw new UnauthorizedException("AccessToken missing");
        }

        const FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID;
        const FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET;
        const appAccessToken = `${FACEBOOK_APP_ID}|${FACEBOOK_APP_SECRET}`

        const res = await axios.get(`https://graph.facebook.com/me?fields=id,name,email&access_token=${accessToken}`)
        const debugUrl = `https://graph.facebook.com/debug_token`

        try {
            const debugResponse = await axios.get(debugUrl, {
                params: {
                    input_token: accessToken,
                    access_token: appAccessToken
                }
            });

            const debugData = debugResponse.data.data;
            if (!debugData.is_valid || debugData.app_id !== FACEBOOK_APP_ID) {
                throw new UnauthorizedException("Invalid Facebook access token or token belongs to another app.");
            }
        } catch (error) {
            console.error('Facebook Debug Token API Error:', error.response?.data || error.message);
            throw new UnauthorizedException("Token verification failed with Facebook API.");
        }

        try {
            const graphApiUrl = `https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${accessToken}`;
            const res = await axios.get(graphApiUrl);
            const userData = res.data;

            const payload = {
                isVerified: true,
                id: userData.id,
                name: userData.name,
                email: userData.email || null,
                picture: userData.picture ? userData.picture.data.url : null
            };
            (request as any).payload = payload;
            return true;

        } catch (error) {
            console.error('Facebook Graph API (User Data) Error:', error.response?.data || error.message);
            throw new UnauthorizedException("Failed to fetch user data with provided access token.");
        }
    }
}