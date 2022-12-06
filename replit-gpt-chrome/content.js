var unsupported_langs = ["shell"]; // languages that ChatGPT might try that either Replit doesn't support
// or is used for run instructions (i.e. shell)

function openInReplIt(lang, code) {
    window.open("https://replit.com/new/" + lang + "#code=" + utf8_to_b64(code));
}

// https://gist.github.com/fundon/1475696/bbbe8b316bd91375526d83841483fc9a11904255
function utf8_to_b64(str) {
    return window.btoa(unescape(encodeURIComponent(str)));
}

// https://gist.github.com/fundon/1475696/bbbe8b316bd91375526d83841483fc9a11904255
function b64_to_utf8(str) {
    return decodeURIComponent(escape(window.atob(str)));
}

function is_gpt_done_responding() {
    let buttons = document.getElementsByTagName("button");
    for (var i = 0; i < buttons.length; i++) {
        if (buttons[i].innerHTML.indexOf("Try again") > 0) {
            return true;
        }
    }
    return false;
}


function runLogic() {
    if (window.location.hostname === "chat.openai.com") {
        window.onload = () => {
            var chatGPTObserver = new MutationObserver(function (mutations) {
                if (!is_gpt_done_responding()) return;
                let code_snippets = document.getElementsByTagName("code");
                for (var i = 0; i < code_snippets.length; i++) {
                    let snippet = code_snippets[i].parentNode.parentNode;
                    if (!snippet.hasAttribute("replit_added")) {
                        snippet.setAttribute("replit_added", true);
                        let action_bar = snippet.children[0];
                        let replit_button = action_bar.children[0].cloneNode(true);
                        replit_button.innerHTML = "<svg width=\"20\" height=\"20\" viewBox=\"0 0 32 32\" fill=\"red\" xmlns=\"http:\/\/www.w3.org\/2000\/svg\"><path d=\"M7 5.5C7 4.67157 7.67157 4 8.5 4H15.5C16.3284 4 17 4.67157 17 5.5V12H8.5C7.67157 12 7 11.3284 7 10.5V5.5Z\" fill=\"var(--foreground-default)\"><\/path><path d=\"M17 12H25.5C26.3284 12 27 12.6716 27 13.5V18.5C27 19.3284 26.3284 20 25.5 20H17V12Z\" fill=\"var(--foreground-default)\"><\/path><path d=\"M7 21.5C7 20.6716 7.67157 20 8.5 20H17V26.5C17 27.3284 16.3284 28 15.5 28H8.5C7.67157 28 7 27.3284 7 26.5V21.5Z\" fill=\"var(--foreground-default)\"><\/path><\/svg>";
                        replit_button.innerHTML += "Open in Repl.it";
                        replit_button.style.marginLeft = "2px";
                        replit_button.style.display = "flex";
                        replit_button.classList.remove(replit_button.classList[replit_button.classList.length - 1]);


                        let lang = code_snippets[i].classList[code_snippets[i].classList.length - 1]
                        if (lang.indexOf("language-") == -1) return; // code block isn't a programming language
                        lang = lang.substring(9);
                        if (unsupported_langs.indexOf(lang) !== -1) return; // code block is of an unsupported language
                        let code = code_snippets[i].innerText;

                        replit_button.onclick = () => { openInReplIt(lang, code); };
                        action_bar.appendChild(replit_button);
                    }
                }
            });

            chatGPTObserver.observe(document, {
                subtree: true,
                childList: true
            });
        }
    } else if (window.location.hostname === "replit.com") {
        // monitor for react page navigation
        window.addEventListener('hashchange', function () { runLogic() });
        window.addEventListener('popstate', function () { runLogic() });

        // replit create window
        if (window.location.pathname.indexOf("/new/") !== -1) {
            // https://stackoverflow.com/questions/23699666/javascript-get-and-set-url-hash-parameters
            var hash = window.location.hash.substr(1);

            var result = hash.split('&').reduce(function (res, item) {
                var parts = item.split('=');
                res[parts[0]] = parts[1];
                return res;
            }, {});

            // get hash part of url, and store it into sessionStorage
            if (result["code"] !== null) {
                sessionStorage.setItem("code", result["code"])
            }

        } else if (sessionStorage.getItem("code") !== null) {
            // if we have code in sessionStorage, put it into the editor

            var replit_code = b64_to_utf8(sessionStorage.getItem("code"));
            sessionStorage.removeItem("code");

            var replitObserver = new MutationObserver(function (mutations) {
                console.log("mut")
                if (document.querySelectorAll("[class^=cm-content]").length > 0) {
                    let code_space = document.querySelectorAll("[class^=cm-content]")[0];

                    // ensure editor is initialized before pasting
                    if (code_space !== null && code_space !== undefined && !(/^\s+$/.test(code_space.innerText)) && code_space.innerText !== replit_code) {
                        console.log("replace")
                        code_space.innerText = replit_code;
                        replitObserver.disconnect();
                    }
                }
            });

            replitObserver.observe(document, {
                subtree: true,
                childList: true
            });
        }
    }
}

runLogic();