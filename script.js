// Immediately Invoked Async Function Expression to handle our async code
(async function() {
    // Initialize the Auth0 client.
    // This client is used to handle user authentication.
    const auth0Client = new auth0.WebAuth({
      domain: "dev-6fyijyitiv2p4qcd.us.auth0.com",
      clientID: "7fAQJYmvpjXsFcMfvBRORPOMrt4iRPEG",
      responseType: "token id_token",
      redirectUri: window.location.origin,
      // Optionally, enable refresh tokens for longer sessions:
      useRefreshTokens: true,
      cacheLocation: "localstorage", // Tokens are persisted in local storage
      scope: "openid profile email" // Request profile information (including 'name')
    });

    let userProfile = null; // Friendly: This will store our logged-in user's information.
  
    /**
     * Updates the user interface based on the authentication state.
     * If the user is logged in, it shows the logout button and user info.
     */
    function updateUI() {
      if (userProfile) {
        // User is logged in; update the page to reflect that.
        document.getElementById("btn-login").style.display = "none";
        document.getElementById("btn-logout").style.display = "inline-block";
        document.getElementById("profile").innerText = "Hello, " + userProfile.name;
        const profileImage = document.getElementById("profile-picture");
        profileImage.src = userProfile.picture || "";
        profileImage.style.display = "inline-block";
      } else {
        // No active session; show the login button.
        document.getElementById("btn-login").style.display = "inline-block";
        document.getElementById("btn-logout").style.display = "none";
        document.getElementById("profile").innerText = "";
        const profileImage = document.getElementById("profile-picture");
        profileImage.src = "";
        profileImage.style.display = "none";
      }
    }
  
    // If the URL has a hash, it might mean we're returning from an Auth0 login.
    if (window.location.hash) {
      auth0Client.parseHash((err, authResult) => {
        if (err) {
          console.error("Error parsing hash:", err);
          return;
        }
        if (authResult && authResult.accessToken) {
          // Retrieve the user's profile information using the access token.
          auth0Client.client.userInfo(authResult.accessToken, (err, profile) => {
            if (err) {
              console.error("Error loading the Profile:", err);
              return;
            }
            userProfile = profile;
            updateUI();
          });
        }
        // Clean the URL hash for security.
        window.location.hash = "";
      });
    } else {
      // Replace the simple UI update with a checkSession call to refresh login state.
      auth0Client.checkSession({}, (err, authResult) => {
        if (err) {
          console.error("Error checking session:", err);
          updateUI();
          return;
        }
        if (authResult && authResult.accessToken) {
          // Retrieve user profile using the access token.
          auth0Client.client.userInfo(authResult.accessToken, (err, profile) => {
            if (!err) {
              userProfile = profile;
            }
            updateUI();
          });
        } else {
          updateUI();
        }
      });
    }
  
    // Attach event listeners for login and logout actions.
    document.getElementById("btn-login").addEventListener("click", () => {
      // Redirect user to Auth0 login.
      auth0Client.authorize();
    });
  
    document.getElementById("btn-logout").addEventListener("click", () => {
      // Log the user out and return to the home page.
      auth0Client.logout({
        returnTo: window.location.origin
      });
    });
  })();
