(function () {
  "use strict";

  var DEFAULT_SCENARIO = "scrap-bot-dilemma";
  var READING_WPM = 200;

  var app = document.getElementById("app");
  var state = {
    scenario: null,
    nodeId: null,
    lineIndex: 0,
    nodeEnteredAt: 0,
    patienceRevealed: false,
    patienceTimerStarted: false,
    patienceTimerId: null,
    choiceHistory: [],
    attempts: []
  };

  function recordChoice(label, nextNodeId) {
    if (nextNodeId === "reflection" || nextNodeId === "restart-transition") {
      var endingNode = currentNode();
      state.attempts.push({
        endingTitle: (endingNode && endingNode.endingTitle) || state.nodeId,
        choices: state.choiceHistory.slice()
      });
      state.choiceHistory = [];
      return;
    }
    state.choiceHistory.push(label);
  }

  function estimatedReadMs(lines) {
    var words = (lines || []).join(" ").trim().split(/\s+/).filter(Boolean).length;
    return (words / READING_WPM) * 60000;
  }

  function scenarioIdFromUrl() {
    var params = new URLSearchParams(window.location.search);
    return params.get("scenario") || DEFAULT_SCENARIO;
  }

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function speakerFor(lineText) {
    var m = /^OVERSEER AI:\s*/.exec(lineText);
    if (m) {
      var rest = lineText.slice(m[0].length);
      var quoted = /^'(.*)'$/.exec(rest);
      return { type: "chat", id: "overseer", name: "OVERSEER AI", text: quoted ? quoted[1] : rest };
    }
    return { type: "narration", text: lineText };
  }

  function renderImage(wrap, node) {
    var img = document.createElement("img");
    img.src = node.image;
    img.alt = node.lines && node.lines[0] ? node.lines[0] : state.scenario.title;
    img.onerror = function () {
      wrap.innerHTML = "";
      var pending = el("div", "art-pending");
      pending.appendChild(el("div", "icon", "🎨"));
      pending.appendChild(el("div", "", "artwork pending"));
      wrap.appendChild(pending);
    };
    wrap.appendChild(img);
  }

  function goTo(nodeId) {
    if (state.patienceTimerId) {
      clearTimeout(state.patienceTimerId);
    }
    state.nodeId = nodeId;
    state.lineIndex = 0;
    state.nodeEnteredAt = Date.now();
    state.patienceRevealed = false;
    state.patienceTimerStarted = false;
    state.patienceTimerId = null;
    render();
    window.scrollTo(0, 0);
  }

  function currentNode() {
    return state.scenario.nodes[state.nodeId];
  }

  function render() {
    var node = currentNode();
    if (!node) {
      app.innerHTML = "";
      app.appendChild(el("p", "", "Missing node: " + state.nodeId));
      return;
    }
    if (node.type === "reflection") {
      renderReflection(node);
    } else if (node.type === "video") {
      renderVideo(node);
    } else {
      renderStory(node);
    }
  }

  function renderStory(node) {
    app.innerHTML = "";
    app.appendChild(el("h1", "game-title", state.scenario.title));

    var panel = el("div", "panel");
    var imgWrap = el("div", "panel-image-wrap");
    renderImage(imgWrap, node);
    panel.appendChild(imgWrap);

    var content = el("div", "panel-content");

    var lines = node.lines || [];
    var thread = el("div", "chat-thread");
    if (node.speaker) {
      thread.appendChild(el("div", "speaker", node.speaker));
    }
    for (var i = 0; i <= Math.min(state.lineIndex, lines.length - 1); i++) {
      var msg = speakerFor(lines[i]);
      if (msg.type === "chat") {
        var row = el("div", "msg-row msg-" + msg.id);
        row.appendChild(el("div", "avatar avatar-" + msg.id));
        var bubble = el("div", "bubble");
        if (msg.name) {
          bubble.appendChild(el("div", "bubble-name", msg.name));
        }
        bubble.appendChild(el("div", "bubble-text", msg.text));
        row.appendChild(bubble);
        thread.appendChild(row);
      } else {
        thread.appendChild(el("p", "narration-line", msg.text));
      }
    }
    content.appendChild(thread);

    var controls = el("div", "controls");
    var isLastLine = state.lineIndex >= lines.length - 1;

    if (!isLastLine) {
      var nextBtn = el("button", "btn-next", "Next →");
      nextBtn.addEventListener("click", function () {
        state.lineIndex += 1;
        render();
      });
      controls.appendChild(nextBtn);
    } else if (node.type === "choice") {
      controls.appendChild(el("div", "prompt", node.prompt || "What do you do?"));
      (node.choices || []).forEach(function (choice) {
        var btn = el("button", "btn-choice", choice.label);
        btn.addEventListener("click", function () {
          recordChoice(choice.label, choice.next);
          goTo(choice.next);
        });
        controls.appendChild(btn);
      });
      if (node.patienceChoice) {
        if (state.patienceRevealed) {
          var secretBtn = el("button", "btn-choice btn-choice-secret", node.patienceChoice.choice.label);
          secretBtn.addEventListener("click", function () {
            recordChoice(node.patienceChoice.choice.label, node.patienceChoice.choice.next);
            goTo(node.patienceChoice.choice.next);
          });
          controls.appendChild(secretBtn);
        } else {
          var thinking = el("div", "thinking-indicator");
          thinking.appendChild(el("span"));
          thinking.appendChild(el("span"));
          thinking.appendChild(el("span"));
          controls.appendChild(thinking);

          if (!state.patienceTimerStarted) {
            state.patienceTimerStarted = true;
            var totalWaitMs = estimatedReadMs(lines) + (node.patienceChoice.waitMs || 60000);
            var remaining = Math.max(0, totalWaitMs - (Date.now() - state.nodeEnteredAt));
            var targetNodeId = state.nodeId;
            state.patienceTimerId = setTimeout(function () {
              if (state.nodeId === targetNodeId) {
                state.patienceRevealed = true;
                render();
              }
            }, remaining);
          }
        }
      }
    } else {
      var advanceLabel = node.type === "ending" ? "Continue →" : "Next →";
      var advanceBtn = el("button", "btn-next", advanceLabel);
      advanceBtn.addEventListener("click", function () {
        goTo(node.next);
      });
      controls.appendChild(advanceBtn);
    }

    content.appendChild(controls);
    panel.appendChild(content);
    app.appendChild(panel);

    thread.scrollTop = thread.scrollHeight;
  }

  function renderVideo(node) {
    app.innerHTML = "";
    app.appendChild(el("h1", "game-title", state.scenario.title));

    var panel = el("div", "panel video-wrap");
    var video = document.createElement("video");
    video.src = node.src;
    video.controls = true;
    video.autoplay = false;
    video.addEventListener("ended", function () {
      goTo(node.next);
    });
    panel.appendChild(video);

    var controls = el("div", "controls");
    var skip = el("span", "skip-link", "Skip →");
    skip.addEventListener("click", function () {
      goTo(node.next);
    });
    controls.appendChild(skip);
    panel.appendChild(controls);

    app.appendChild(panel);
  }

  function showPathModal() {
    var dialog = document.createElement("dialog");
    dialog.className = "path-modal";

    dialog.appendChild(el("h2", "", "Your paths so far"));

    if (state.attempts.length) {
      var wrap = el("div", "path-attempts");
      state.attempts.forEach(function (attempt, index) {
        var block = el("div", "path-attempt");
        block.appendChild(el("div", "path-attempt-title", "Attempt " + (index + 1) + " — " + attempt.endingTitle));
        var list = document.createElement("ol");
        list.className = "path-list";
        attempt.choices.forEach(function (label) {
          list.appendChild(el("li", "", label));
        });
        block.appendChild(list);
        wrap.appendChild(block);
      });
      dialog.appendChild(wrap);
    } else {
      dialog.appendChild(el("p", "", "No completed runs yet."));
    }

    function closeModal() {
      dialog.close();
      dialog.remove();
    }

    var closeBtn = el("button", "btn-next", "Close");
    closeBtn.addEventListener("click", closeModal);
    dialog.appendChild(closeBtn);

    dialog.addEventListener("click", function (e) {
      var box = dialog.getBoundingClientRect();
      var inside = e.clientX >= box.left && e.clientX <= box.right && e.clientY >= box.top && e.clientY <= box.bottom;
      if (!inside) closeModal();
    });

    document.body.appendChild(dialog);
    dialog.showModal();
  }

  function renderReflection(node) {
    app.innerHTML = "";
    app.appendChild(el("h1", "game-title", state.scenario.title));

    if (node.image) {
      var headerWrap = el("div", "panel-image-wrap reflection-header-image");
      renderImage(headerWrap, node);
      app.appendChild(headerWrap);
    }

    var box = el("div", "reflection");
    var headRow = el("div", "reflection-head");
    headRow.appendChild(el("h2", "", node.title || "Before You Go"));
    var reviewBtn = el("button", "btn-review", "🗺 Review your paths");
    reviewBtn.addEventListener("click", function () {
      showPathModal();
    });
    headRow.appendChild(reviewBtn);
    box.appendChild(headRow);

    if (node.message) {
      box.appendChild(el("p", "handoff-copy", node.message));
    }

    var footer = el("div", "again-row");
    footer.appendChild(el("span", "", "Want to see a different ending first?"));
    var restartBtn = el("button", "btn-restart", "Restart ↻");
    restartBtn.addEventListener("click", function () {
      goTo(state.scenario.start);
    });
    footer.appendChild(restartBtn);
    box.appendChild(footer);

    app.appendChild(box);
  }

  function boot() {
    var scenarioId = scenarioIdFromUrl();
    fetch("scenarios/" + scenarioId + ".json")
      .then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.json();
      })
      .then(function (scenario) {
        state.scenario = scenario;
        document.title = scenario.title;
        var params = new URLSearchParams(window.location.search);
        var startNode = params.get("node") || scenario.start;
        goTo(startNode);
      })
      .catch(function (err) {
        app.innerHTML = "";
        app.appendChild(el("h1", "game-title", "Couldn't load scenario"));
        app.appendChild(el("p", "", String(err)));
        app.appendChild(el("p", "", "If you're opening this file directly (file://), run a local server instead — see CLAUDE.md."));
      });
  }

  window.addEventListener("beforeunload", function (e) {
    if (state.attempts.length || state.choiceHistory.length) {
      e.preventDefault();
      e.returnValue = "";
    }
  });

  boot();
})();
