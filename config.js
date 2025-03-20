// Auth0 Configuration
// In a real application, these values should come from environment variables
const config = {
    auth0: {
        domain: "dev-6fyijyitiv2p4qcd.us.auth0.com",
        clientId: "7fAQJYmvpjXsFcMfvBRORPOMrt4iRPEG",
        // Add comments explaining each configuration option
        responseType: "token id_token",     // Request both access and ID tokens
        useRefreshTokens: true,            // Enable automatic token refresh
        cacheLocation: "localstorage",     // Store tokens in browser's localStorage
        scope: "openid profile email"      // Request user profile information
    }
}; 