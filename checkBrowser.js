let checkBrowser = 0;
window.addEventListener("load", () => {
  // CHROME
  if (navigator.userAgent.indexOf("Chrome") != -1 ) {
    checkBrowser = 1;
    console.log("Google Chrome");
  }
  // FIREFOX
  else if (navigator.userAgent.indexOf("Firefox") != -1 ) {
    checkBrowser = 2;
    console.log("Mozilla Firefox");
  }
  // INTERNET EXPLORER
  else if (navigator.userAgent.indexOf("MSIE") != -1 ) {
    checkBrowser = 1;
    console.log("Internet Exploder");
  }
  // EDGE
  else if (navigator.userAgent.indexOf("Edge") != -1 ) {
    checkBrowser = 1;
    console.log("Internet Exploder");
  }
  // SAFARI
  else if (navigator.userAgent.indexOf("Safari") != -1 ) {
    checkBrowser = 1;
    console.log("Safari");
  }
  // OPERA
  else if (navigator.userAgent.indexOf("Opera") != -1 ) {
    checkBrowser = 1;
    console.log("Opera");
  }
  // YANDEX BROWSER
  else if (navigator.userAgent.indexOf("YaBrowser") != -1 ) {
    checkBrowser = 1;
    console.log("YaBrowser");
  }
  // OTHERS
  else {
    checkBrowser = 1;
    console.log("Others");
  }
});