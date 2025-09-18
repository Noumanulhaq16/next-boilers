export type OAuthProviders = 'google' | 'apple' | 'facebook';

export type IOAuthTokenData = {
    id: string;
    type: 'google' | 'apple' | 'facebook';
    email: string;
};

export default interface IOAuth {
    GetTokenData(token: string): Promise<IOAuthTokenData>;
}
