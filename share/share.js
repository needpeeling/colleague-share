window.onload = function() {
  const urlParams = new URLSearchParams(window.location.search);
  const postId = urlParams.get('post');

  if (postId) {
    const appUrl = "colleague://posts/" + postId;
    window.location.href = appUrl;
    setTimeout(function() {
      console.log("App didn't open. User might not have it installed.");
      // window.location.href = "link to app store ...";
    }, 2000);
  }
};
