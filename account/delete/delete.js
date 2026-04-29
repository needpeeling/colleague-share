let auth0 = null;
const loginBtn = document.getElementById("btn-login");
const deleteBtn = document.getElementById("btn-delete");
const AUDIENCE = "https://dev-uvy36glpi6qs2vcx.us.auth0.com/api/v2/";
const CLIENT_ID = "XAkulvRB5Ys0XZuWPMsxgVfH5T85Kjqn";
const DOMAIN = "dev-uvy36glpi6qs2vcx.us.auth0.com";
const DELETE_URL = "http://localhost:3000/api/users";
const REDIRECT_URI = window.location.origin + window.location.pathname;
const REDIRECT_LOGOUT_URL = window.location.origin;

window.onload = async () => {
  try {
    const createClient =
      window.createAuth0Client || window.auth0.createAuth0Client;
    auth0 = await createClient({
      domain: DOMAIN,
      clientId: CLIENT_ID,
      authorizationParams: {
        redirect_uri: REDIRECT_URI,
        audience: AUDIENCE,
      },
    });

    const query = window.location.search;
    if (query.includes("code=") && query.includes("state=")) {
      await auth0.handleRedirectCallback();
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    loginBtn.disabled = false;
    loginBtn.innerText = "Login with Auth0";

    const isAuthenticated = await auth0.isAuthenticated();

    if (isAuthenticated) {
      const user = await auth0.getUser();
      document.getElementById("ui-unauthenticated").style.display = "none";
      document.getElementById("ui-authenticated").style.display = "block";
      document.getElementById("user-email").innerText = user.email;
    }
  } catch (err) {
    console.error("Auth0 initialization failed", err);
    loginBtn.innerText = "Error Loading Login";
  }
};

loginBtn.onclick = async () => {
  if (auth0) {
    await auth0.loginWithRedirect();
  } else {
    alert("Auth0 is still loading. Please try again in a moment.");
  }
};

deleteBtn.onclick = async () => {
  const confirmed = confirm("Are you absolutely sure? This cannot be undone.");
  if (!confirmed) return;

  deleteBtn.disabled = true;
  deleteBtn.innerText = "Deleting...";

  try {
    const token = await auth0.getTokenSilently({
      authorizationParams: {
        audience: AUDIENCE,
      },
    });
    console.log(token);

    // 2. Send the request to your backend
    const response = await fetch(DELETE_URL, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // Your backend validates this
      },
    });

    if (response.ok) {
      alert("Account successfully deleted. You will now be logged out.");
      auth0.logout({
        logoutParams: {
          returnTo: REDIRECT_LOGOUT_URL,
        },
      });
    } else {
      const errorData = await response.json();
      throw new Error(errorData.message || "Server error");
    }
  } catch (err) {
    console.error("Deletion failed:", err);
    alert("Failed to delete account: " + err.message);
    deleteBtn.disabled = false;
    deleteBtn.innerText = "Permanently Delete My Data";
  }
};
