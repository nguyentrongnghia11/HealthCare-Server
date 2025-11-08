import { OAuth2Client } from 'google-auth-library';

export const GoogleClientProvider = {
  provide: 'GOOGLE_CLIENT',
  useFactory: () => {
    return new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  },
};

//  @Inject('GOOGLE_CLIENT') private readonly client: OAuth2Client,