// ==UserScript==
// @name     Unnamed Script 405792
// @version  1
// @grant    none
//@include https://replit.com/new/*
//@include https://chat.openai.com/*
// @run-at document-idle
// ==/UserScript==

function openInReplIt(lang, code) {
    window.open("https://replit.com/new/"+lang+"#code="+utf8_to_b64(code));
}

function utf8_to_b64( str ) {
    return window.btoa(unescape(encodeURIComponent( str )));
}

function b64_to_utf8( str ) {
    return decodeURIComponent(escape(window.atob( str )));
}

function runLogic() {
    console.log("winload")
        console.log("tload")
        if (window.location.hostname === "chat.openai.com") {
            console.log("openai")
            window.onload = () => {
                var observer = new MutationObserver(function(mutations) {
                    console.log("mut")
                    if(document.querySelector("[class^=sc-18srrdc-3]") !== null && document.querySelectorAll("[class^=sc-18srrdc-3]").length % 3 !== 0) return;
                    let code_snippets = document.querySelectorAll("[class^=sc-1ifybgh-0]");
                    for(var i = 0; i < code_snippets.length; i++) {
                        let snippet = code_snippets[i];
                        if(!snippet.hasAttribute("replit_added")) {
                            snippet.setAttribute("replit_added", true);
                            let action_bar = snippet.children[0];
                            let replit_button = action_bar.children[0].cloneNode(true);
                            replit_button.innerHTML = "<svg width=\"20\" height=\"20\" viewBox=\"0 0 32 32\" fill=\"red\" xmlns=\"http:\/\/www.w3.org\/2000\/svg\"><path d=\"M7 5.5C7 4.67157 7.67157 4 8.5 4H15.5C16.3284 4 17 4.67157 17 5.5V12H8.5C7.67157 12 7 11.3284 7 10.5V5.5Z\" fill=\"var(--foreground-default)\"><\/path><path d=\"M17 12H25.5C26.3284 12 27 12.6716 27 13.5V18.5C27 19.3284 26.3284 20 25.5 20H17V12Z\" fill=\"var(--foreground-default)\"><\/path><path d=\"M7 21.5C7 20.6716 7.67157 20 8.5 20H17V26.5C17 27.3284 16.3284 28 15.5 28H8.5C7.67157 28 7 27.3284 7 26.5V21.5Z\" fill=\"var(--foreground-default)\"><\/path><\/svg>";
                            replit_button.innerHTML += "Open in Repl.it";
                            replit_button.style.marginLeft = "2px";
                            replit_button.style.display = "flex";
                            replit_button.classList.remove(replit_button.classList[replit_button.classList.length-1]);

                            let lang = snippet.children[1].children[0].classList[3].substring(9);
                            let code = snippet.children[1].children[0].innerText;

                            replit_button.onclick = () => {openInReplIt(lang, code);};

                            action_bar.appendChild(replit_button);
                        }
                    }
                });
                observer.observe(document, {
                    subtree: true,
                    childList:true
                });
            }
        } else if (window.location.hostname === "replit.com") {
            console.log("replit")
            // replit create window
            if(window.location.pathname.indexOf("/new/") !== -1) {
                console.log("new")
                // https://stackoverflow.com/questions/23699666/javascript-get-and-set-url-hash-parameters
                var hash = window.location.hash.substr(1);

                var result = hash.split('&').reduce(function (res, item) {
                    var parts = item.split('=');
                    res[parts[0]] = parts[1];
                    return res;
                    }, {});

                if(result["code"] !== null) {
                    sessionStorage.setItem("code", result["code"])
                }
            }else {
                console.log("paste")

                var observer2 = new MutationObserver(function(mutations) {
                    if(document.querySelectorAll("[class^=cm-content]").length > 0) {
                        setTimeout(()=>{
                            let code_space = document.querySelectorAll("[class^=cm-content]")[0];
                            let code = b64_to_utf8(sessionStorage.getItem("code"));
                            code_space.innerText = code;

                            //sessionStorage.removeItem("code");
                        }, 1000);
                        observer2.disconnect();
                    }

                });

                observer2.observe(document, {
                    subtree: true,
                    childList:true
                });
}
        }

}

window.addEventListener('hashchange', function () { runLogic()});
window.addEventListener('popstate', function () { runLogic()});
runLogic();