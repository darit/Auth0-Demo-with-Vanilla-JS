// Auth0 Demo Script
// This script demonstrates how to implement authentication using Auth0
// in a simple and educational way.

// Wait for DOM and Auth0 SDK to load
document.addEventListener('DOMContentLoaded', function() {
    // Check if Auth0 is loaded
    if (typeof auth0 === 'undefined') {
        console.warn('Auth0 SDK is not loaded yet. Please check your internet connection.');
        return;
    }

    // UI Helper Functions
    const ui = {
        // Show or hide the loading spinner
        showLoading: function(show) {
            document.getElementById('loading-spinner').style.display = show ? 'block' : 'none';
            document.getElementById('btn-login').disabled = show;
            document.getElementById('btn-logout').disabled = show;
        },

        // Display error messages to the user
        showError: function(message, isInitialLoad = false) {
            // Don't show errors during initial load
            if (isInitialLoad) {
                return;
            }
            const errorElement = document.getElementById('error-message');
            errorElement.textContent = message;
            errorElement.style.display = 'block';
            // Hide error after 5 seconds
            setTimeout(() => {
                errorElement.style.display = 'none';
            }, 5000);
        },

        // Update the UI based on authentication state
        updateAuthenticationState: function(isAuthenticated, profile) {
            document.getElementById("btn-login").style.display = isAuthenticated ? "none" : "inline-block";
            document.getElementById("btn-logout").style.display = isAuthenticated ? "inline-block" : "none";
            
            const profileElement = document.getElementById("profile");
            const profileImage = document.getElementById("profile-picture");
            
            if (isAuthenticated && profile) {
                profileElement.innerHTML = `
                    <h2>Welcome, ${profile.name}!</h2>
                    <p>Email: ${profile.email}</p>
                `;
                profileImage.src = profile.picture || "";
                profileImage.style.display = "inline-block";
            } else {
                profileElement.innerHTML = "";
                profileImage.style.display = "none";
                profileImage.src = "";
            }
        }
    };

    // Initialize Auth0 client with our configuration
    const auth0Client = new auth0.WebAuth({
        domain: config.auth0.domain,
        clientID: config.auth0.clientId,
        responseType: config.auth0.responseType,
        redirectUri: window.location.origin,
        useRefreshTokens: config.auth0.useRefreshTokens,
        cacheLocation: config.auth0.cacheLocation,
        scope: config.auth0.scope
    });

    // Session Management
    let tokenRenewalTimeout;
    let isInitialLoad = true;

    // Handle authentication result and user profile
    function handleAuthResult(err, authResult) {
        ui.showLoading(false);
        
        if (err) {
            if (!isInitialLoad || (err.error && err.error !== 'login_required')) {
                console.error('Authentication error:', err);
                ui.showError(err.description || 'An error occurred during authentication');
            }
            isInitialLoad = false;
            return;
        }

        if (authResult && authResult.accessToken) {
            // Get user information using the access token
            auth0Client.client.userInfo(authResult.accessToken, (err, profile) => {
                if (err) {
                    ui.showError('Error loading user profile', isInitialLoad);
                    return;
                }

                userProfile = profile;
                ui.updateAuthenticationState(true, profile);

                // Schedule token renewal
                scheduleTokenRenewal(authResult);
            });
        } else {
            ui.updateAuthenticationState(false, null);
        }
        isInitialLoad = false;
    }

    // Schedule token renewal before the access token expires
    function scheduleTokenRenewal(authResult) {
        const expiresIn = (authResult.expiresIn || 3600) * 1000;
        const renewalTime = expiresIn - (5 * 60 * 1000); // 5 minutes before expiry

        // Clear any existing renewal
        if (tokenRenewalTimeout) {
            clearTimeout(tokenRenewalTimeout);
        }

        // Schedule the renewal
        tokenRenewalTimeout = setTimeout(() => {
            auth0Client.checkSession({}, handleAuthResult);
        }, renewalTime);
    }

    // Check if we're returning from Auth0 (handling the authentication callback)
    if (window.location.hash) {
        ui.showLoading(true);
        isInitialLoad = false; // This is a callback, not initial load
        
        auth0Client.parseHash((err, authResult) => {
            // Clear the URL hash for security
            window.location.hash = "";
            handleAuthResult(err, authResult);
        });
    } else {
        // Check if there's an existing session
        ui.showLoading(true);
        
        auth0Client.checkSession({}, handleAuthResult);
    }

    // Event Listeners for Login/Logout
    document.getElementById("btn-login").addEventListener("click", () => {
        isInitialLoad = false; // User initiated action
        ui.showLoading(true);
        auth0Client.authorize();
    });

    document.getElementById("btn-logout").addEventListener("click", () => {
        // Clear the user profile and token renewal
        userProfile = null;
        if (tokenRenewalTimeout) {
            clearTimeout(tokenRenewalTimeout);
        }

        // Redirect to Auth0 logout
        auth0Client.logout({
            returnTo: window.location.origin
        });
    });
});
