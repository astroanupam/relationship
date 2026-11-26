/* ===== tools.js ===== */
/* Practice labs: calculator, Lo Shu, two-person assessment, trigger diary, trait matrix, report builder, growth planner. */
(function () {
  var U = NS.ui, S = U.S, E = NS.engine, t = U.t, L = U.L, lr = U.lr, esc = U.esc;
  var V = NS.views = NS.views || {};

  function head(kick, title, lead) { return '<p class="kick dark">' + kick + "</p><h1>" + title + "</h1>" + (lead ? '<p class="lead">' + lead + "</p>" : ""); }
  V.head = head;
  function field(label, id, type, val, extra) { return "<label>" + label + '<input id="' + id + '" type="' + type + '" value="' + esc(val || "") + '" ' + (extra || "") + "></label>"; }
  function $(id) { return document.getElementById(id); }
  function archLink(n) { var a = NS.num && NS.num[n]; return '<a href="#/arch/' + n + '"><b>' + n + "</b> " + (a ? t(a.name) : "") + "</a>"; }
  function privacy() { return '<p class="small muted">' + L("Everything you type stays on this device. Use another person’s details only with their consent.", "आप जो लिखते हैं वह इसी उपकरण पर रहता है। किसी अन्य व्यक्ति का विवरण उसकी सहमति से ही प्रयोग करें।") + "</p>"; }

  function wordTable(words) {
    return words.map(function (w) { return '<div class="letters"><b>' + esc(w.word) + "</b> " + w.cells.map(function (c) { return "<span>" + c[0] + "<small>" + c[1] + "</small></span>"; }).join("") + " <em>= " + w.total + " → " + w.root + "</em></div>"; }).join("");
  }
  function profileNumbers(name, dob) {
    var v = E.vedic(dob), py = E.pythagorean(name, dob), ch = E.chaldean(name);
    return { v: v, py: py, ch: ch };
  }
  V.profileNumbers = profileNumbers;

  /* ---------- four-system calculator ---------- */
  V.calc = function () {
    var c = S.calc || (S.calc = {});
    return { html: head(L("PRACTICE LAB", "अभ्यास लैब"), L("Four-system numerology calculator", "चार-पद्धति अंक कैलकुलेटर"), L("Vedic, Pythagorean and Chaldean numbers side by side, with every sum shown. The Lo Shu grid has its own lab.", "वैदिक, पाइथागोरियन और कैल्डियन अंक साथ-साथ, हर जोड़ दिखाया हुआ। लो शू ग्रिड की अलग लैब है।")) +
      '<div class="form">' + field(L("Name in English letters", "नाम अंग्रेज़ी अक्षरों में"), "cName", "text", c.name, 'autocomplete="off" maxlength="80"') + field(L("Date of birth", "जन्म तिथि"), "cDob", "date", c.dob) + '<button class="btn gold" id="cGo">' + L("Calculate", "गणना करें") + "</button></div>" + privacy() + '<div id="cOut" aria-live="polite"></div>',
      after: function () {
        function run() {
          c.name = $("cName").value; c.dob = $("cDob").value; U.save();
          var r = profileNumbers(c.name, c.dob), h = "";
          var hasName = r.ch.compound > 0;
          if (!r.v && !hasName) { $("cOut").innerHTML = '<p class="note">' + L("Enter a name in English letters, a date of birth, or both.", "अंग्रेज़ी अक्षरों में नाम, जन्म तिथि या दोनों लिखें।") + "</p>"; return; }
          var rows = [];
          if (r.v) rows.push([lr("Vedic", "वैदिक"), lr("Mulank (Birth / Psychic)", "मूलांक"), r.v.mulank, r.v.mulankSteps], [lr("Vedic", "वैदिक"), lr("Bhagyank (Destiny)", "भाग्यांक"), r.v.bhagyank, r.v.bhagyankSteps]);
          if (r.py.lifePath) rows.push([lr("Pythagorean", "पाइथागोरियन"), lr("Life Path", "लाइफ पाथ"), mm(r.py.lifePath), r.py.lifePath.steps]);
          if (hasName) {
            rows.push([lr("Pythagorean", "पाइथागोरियन"), lr("Expression", "एक्सप्रेशन"), mm(r.py.expression), r.py.expression.steps]);
            if (r.py.soul) rows.push([lr("Pythagorean", "पाइथागोरियन"), lr("Soul Urge (vowels)", "सोल अर्ज (स्वर)"), mm(r.py.soul), r.py.soul.steps]);
            if (r.py.personality) rows.push([lr("Pythagorean", "पाइथागोरियन"), lr("Personality (consonants)", "पर्सनैलिटी (व्यंजन)"), mm(r.py.personality), r.py.personality.steps]);
            rows.push([lr("Chaldean", "कैल्डियन"), lr("Name number (Namank)", "नामांक"), r.ch.root, lr("compound ", "संयुक्त अंक ") + r.ch.steps]);
          }
          h += "<h3>" + L("Numbers and working", "अंक और गणना") + "</h3>" + U.table([["System", "पद्धति"], ["Component", "घटक"], ["Number", "अंक"], ["Working", "गणना"]], rows);
          if (hasName) {
            h += "<h4>" + L("Chaldean letter values", "कैल्डियन अक्षर मान") + "</h4>" + wordTable(r.ch.words) + "<h4>" + L("Pythagorean letter values", "पाइथागोरियन अक्षर मान") + "</h4>" + wordTable(r.py.words);
            if (NS.compound && NS.compound[r.ch.compound]) h += '<div class="keybox"><b>' + L("Chaldean compound ", "कैल्डियन संयुक्त अंक ") + r.ch.compound + ":</b> " + t(NS.compound[r.ch.compound]) + "</div>";
            else if (r.ch.compound > 52) h += '<p class="small muted">' + L("This total is above 52; the course lists compound themes for 10 to 52 and reads larger totals by their root.", "यह योग 52 से बड़ा है; कोर्स 10 से 52 तक के संयुक्त अंक बताता है, बड़े योग को मूल अंक से पढ़ें।") + "</p>";
          }
          var seen = {};
          function add(n, label) { if (!n) return; (seen[n] = seen[n] || []).push(label); }
          if (r.v) { add(r.v.mulank, lr("Mulank", "मूलांक")); add(r.v.bhagyank, lr("Bhagyank", "भाग्यांक")); }
          if (hasName) { add(r.ch.root, lr("Namank (Chaldean)", "नामांक (कैल्डियन)")); add(r.py.expression.root, lr("Expression (Pyth.)", "एक्सप्रेशन (पाइथ.)")); }
          if (r.py.lifePath) add(r.py.lifePath.root, lr("Life Path (Pyth.)", "लाइफ पाथ (पाइथ.)"));
          h += "<h3>" + L("Archetypes in this profile", "इस प्रोफ़ाइल के आर्कटाइप") + '</h3><div class="grid">' + Object.keys(seen).sort(function (a, b) { return seen[b].length - seen[a].length; }).map(function (n) { var a = NS.num && NS.num[n]; return '<a class="tile" href="#/arch/' + n + '"><b>' + n + " · " + (a ? t(a.name) : "") + "</b><small>" + esc(seen[n].join(", ")) + "</small>" + (r.v ? "<small>" + L("Vedic planet: ", "वैदिक ग्रह: ") + t(E.PLANET[n]) + "</small>" : "") + "</a>"; }).join("") + "</div>";
          h += '<p class="note">' + L("Systems can give different numbers. Name the system with every number and do not merge them into one value. A repeated number is a theme to explore, not proof.", "पद्धतियाँ अलग अंक दे सकती हैं। हर अंक के साथ पद्धति का नाम लिखें और उन्हें एक मान में न मिलाएँ। दोहराया अंक खोजने योग्य विषय है, प्रमाण नहीं।") + "</p>";
          $("cOut").innerHTML = h;
        }
        function _() { }
        $("cGo").onclick = run;
        if (c.name || c.dob) run();
      } };
  };
  function mm(p) { if (!p) return "–"; return p.master !== p.root ? p.master + " / " + p.root : p.root; }

  /* ---------- Lo Shu lab ---------- */
  function gridHtml(g) {
    return '<div class="loshu" role="img" aria-label="Lo Shu grid">' + E.LAYOUT.map(function (n) { return '<div class="' + (g.counts[n] ? "has" : "none") + '"><b>' + (g.counts[n] ? new Array(g.counts[n] + 1).join(n) : "–") + "</b><small>" + n + "</small></div>"; }).join("") + "</div>";
  }
  V.loshu = function () {
    var c = S.loshuIn || (S.loshuIn = { mulank: false, bhagyank: false, kua: "" });
    function chk(id, label, on) { return '<label class="chk"><input type="checkbox" id="' + id + '" ' + (on ? "checked" : "") + "> " + label + "</label>"; }
    return { html: head(L("PRACTICE LAB", "अभ्यास लैब"), L("Lo Shu grid lab", "लो शू ग्रिड लैब"), L("Place the birth-date digits, then study repeated numbers, missing numbers and planes. Schools differ on which extra numbers are added, so you choose and record it.", "जन्म तिथि के अंक रखें, फिर दोहराए गए अंक, अनुपस्थित अंक और तल पढ़ें। अतिरिक्त अंक जोड़ने पर मत भिन्न हैं, इसलिए आप चुनें और दर्ज करें।")) +
      '<div class="form">' + field(L("Date of birth", "जन्म तिथि"), "lDob", "date", c.dob) + "<label>" + L("Kua number", "कुआ अंक") + '<select id="lKua"><option value="">' + L("Do not add", "न जोड़ें") + '</option><option value="m">' + L("Add (traditional male formula)", "जोड़ें (पारंपरिक पुरुष सूत्र)") + '</option><option value="f">' + L("Add (traditional female formula)", "जोड़ें (पारंपरिक महिला सूत्र)") + '</option></select></label></div><div class="inline">' + chk("lMu", L("Also add Mulank", "मूलांक भी जोड़ें"), c.mulank) + chk("lBh", L("Also add Bhagyank", "भाग्यांक भी जोड़ें"), c.bhagyank) + '</div><div id="lOut" aria-live="polite"></div>',
      after: function () {
        $("lKua").value = c.kua || "";
        function run() {
          c.dob = $("lDob").value; c.mulank = $("lMu").checked; c.bhagyank = $("lBh").checked; c.kua = $("lKua").value; U.save();
          var g = E.loshu(c.dob, c);
          if (!g) { $("lOut").innerHTML = '<p class="note">' + L("Enter a valid date of birth.", "सही जन्म तिथि लिखें।") + "</p>"; return; }
          var info = NS.loshu || {}, h = '<div class="labgrid"><div>' + gridHtml(g) + '<p class="small muted">' + (g.added.length ? L("Added: ", "जोड़े गए: ") + esc(g.added.map(function (a) { return a[0] + " " + a[1]; }).join(", ")) : L("Birth-date digits only.", "केवल जन्म तिथि के अंक।")) + "</p></div><div>";
          h += "<h3>" + L("Planes", "तल (प्लेन)") + "</h3>" + U.table([["Plane", "तल"], ["Filled", "भरे"], ["Reading", "पाठ"]], g.planes.map(function (p) { var d = NS.planes && NS.planes[p.key]; return [d ? lr(d.name[0], d.name[1]) + " (" + p.cells.join("-") + ")" : p.cells.join("-"), p.have + " / 3", d ? (p.have === 3 ? U.raw(d.full) : p.have === 0 ? U.raw(d.empty) : lr("Partly filled: read the present numbers individually.", "आंशिक भरा: उपस्थित अंकों को अलग-अलग पढ़ें।")) : ""]; })) + "</div></div>";
          h += "<h3>" + L("Number by number", "अंक-दर-अंक") + "</h3>";
          for (var n = 1; n <= 9; n++) {
            var x = info[n]; if (!x) continue;
            var k = g.counts[n];
            h += '<details class="check"' + (k !== 1 ? " open" : "") + "><summary><b>" + n + "</b> · " + (k === 0 ? L("missing", "अनुपस्थित") : k === 1 ? L("present once", "एक बार") : L("repeated ", "दोहराया ") + k + "×") + "</summary><p>" + t(k === 0 ? x.missing : k === 1 ? x.present : x.repeat) + "</p><p><b>" + L("Practice: ", "अभ्यास: ") + "</b>" + t(x.practice) + "</p></details>";
          }
          h += '<p class="note">' + L("A missing number is not a defect. Treat it as a question to explore through real behaviour.", "अनुपस्थित अंक कोई दोष नहीं है। इसे वास्तविक व्यवहार से जाँचने वाला प्रश्न मानें।") + "</p>";
          var k2 = c.kua ? E.kua(c.dob, c.kua) : null;
          if (k2 && k2.early) h += '<p class="note">' + L("This birth date falls early in the year. Many schools use the previous year for Kua if it is before the Chinese New Year.", "यह जन्म तिथि वर्ष के आरंभ में है। चीनी नववर्ष से पहले जन्म हो तो अनेक मत कुआ के लिए पिछला वर्ष लेते हैं।") + "</p>";
          $("lOut").innerHTML = h;
        }
        ["lDob", "lMu", "lBh", "lKua"].forEach(function (id) { $(id).onchange = run; });
        if (c.dob) run();
      } };
  };

  /* ---------- two-person assessment ---------- */
  var BASIS = [["mulank", ["Mulank (Vedic)", "मूलांक (वैदिक)"]], ["bhagyank", ["Bhagyank (Vedic)", "भाग्यांक (वैदिक)"]], ["lifepath", ["Life Path (Pythagorean)", "लाइफ पाथ (पाइथागोरियन)"]], ["namank", ["Name number (Chaldean)", "नामांक (कैल्डियन)"]], ["expression", ["Expression (Pythagorean)", "एक्सप्रेशन (पाइथागोरियन)"]]];
  function numberBy(basis, name, dob) {
    var r = profileNumbers(name, dob);
    if (basis === "mulank") return r.v && r.v.mulank;
    if (basis === "bhagyank") return r.v && r.v.bhagyank;
    if (basis === "lifepath") return r.py.lifePath && r.py.lifePath.root;
    if (basis === "namank") return r.ch.root || null;
    return r.py.expression && r.py.expression.root;
  }
  V.numberBy = numberBy; V.BASIS = BASIS;
  var LEVELS = [["Not assessed", "आकलन नहीं"], ["Needs focused conversation", "केंद्रित बातचीत चाहिए"], ["Mixed: some ease, some friction", "मिश्रित: कुछ सहज, कुछ घर्षण"], ["Currently working well", "अभी अच्छा चल रहा है"]];
  V.LEVELS = LEVELS;
  V.compare = function () {
    var c = S.compare; c.a = c.a || {}; c.b = c.b || {}; c.basis = c.basis || "mulank"; c.dim = c.dim || {};
    var h = head(L("PRACTICE LAB", "अभ्यास लैब"), L("Two-person relationship assessment", "दो-व्यक्ति संबंध आकलन"), L("The numbers give discussion themes. The eight dimensions are rated from what the two people actually report and do. There is no total score and no compatibility verdict.", "अंक चर्चा के विषय देते हैं। आठ आयाम दोनों व्यक्तियों के वास्तविक अनुभव और व्यवहार से आँके जाते हैं। कोई कुल अंक या अनुकूलता निर्णय नहीं है।")) + privacy();
    h += '<div class="grid2">' + ["a", "b"].map(function (k) { return "<fieldset><legend>" + (k === "a" ? L("Individual A", "व्यक्ति A") : L("Individual B", "व्यक्ति B")) + '</legend><div class="form">' + field(L("Name (English letters)", "नाम (अंग्रेज़ी अक्षर)"), k + "Name", "text", c[k].name, 'maxlength="80"') + field(L("Date of birth", "जन्म तिथि"), k + "Dob", "date", c[k].dob) + "</div></fieldset>"; }).join("") + "</div>";
    h += '<div class="form"><label>' + L("Which number do you want to compare?", "किस अंक की तुलना करनी है?") + '<select id="basis">' + BASIS.map(function (b) { return '<option value="' + b[0] + '">' + t(b[1]) + "</option>"; }).join("") + "</select></label><label>" + L("Relationship type", "संबंध का प्रकार") + '<input id="relType" type="text" maxlength="60" value="' + esc(c.type || "") + '"></label></div><div id="pairOut" aria-live="polite"></div>';
    h += "<h3>" + L("Relationship Stress Matrix: eight dimensions", "संबंध तनाव मैट्रिक्स: आठ आयाम") + "</h3>" + NS.dimensions.map(function (d, i) {
      var v = c.dim[i] || {};
      return "<fieldset><legend>" + (i + 1) + ". " + t(d.name) + '</legend><p class="small muted">' + d.points.map(t).join(" · ") + '</p><select data-dim="' + i + '" aria-label="rating">' + LEVELS.map(function (l, j) { return '<option value="' + j + '"' + ((v.l || 0) == j ? " selected" : "") + ">" + t(l) + "</option>"; }).join("") + '</select><textarea rows="2" data-note="' + i + '" placeholder="' + L("Observed evidence from both people", "दोनों से मिले वास्तविक प्रमाण") + '">' + esc(v.n || "") + "</textarea></fieldset>";
    }).join("") + '<div id="dimSum"></div><div class="tools"><button class="btn gold" data-print>' + L("Print / save as PDF", "प्रिंट / PDF सहेजें") + '</button><a class="btn" href="#/report">' + L("Build the relationship report", "संबंध रिपोर्ट बनाएँ") + '</a><button class="btn danger" id="cmpClear">' + L("Clear this assessment", "यह आकलन मिटाएँ") + "</button></div>";
    return { html: h, after: function () {
      $("basis").value = c.basis;
      function summary() {
        var by = { 1: [], 2: [], 3: [] };
        NS.dimensions.forEach(function (d, i) { var l = (c.dim[i] || {}).l; if (l > 0) by[l].push(U.raw(d.name)); });
        var any = by[1].length + by[2].length + by[3].length;
        $("dimSum").innerHTML = any ? '<div class="duo"><div class="pos"><h4>' + L("Strengths to protect", "बनाए रखने योग्य शक्तियाँ") + "</h4><p>" + esc(by[3].join(", ") || "–") + '</p></div><div class="neg"><h4>' + L("Start conversations here", "बातचीत यहाँ से शुरू करें") + "</h4><p>" + esc(by[1].join(", ") || "–") + "</p></div></div><p><b>" + L("Mixed: ", "मिश्रित: ") + "</b>" + esc(by[2].join(", ") || "–") + "</p>" : "";
      }
      function pair() {
        c.a.name = $("aName").value; c.a.dob = $("aDob").value; c.b.name = $("bName").value; c.b.dob = $("bDob").value; c.basis = $("basis").value; c.type = $("relType").value; U.save();
        var x = numberBy(c.basis, c.a.name, c.a.dob), y = numberBy(c.basis, c.b.name, c.b.dob);
        if (!x || !y) { $("pairOut").innerHTML = '<p class="small muted">' + L("Fill in the details needed for the chosen number for both people (a name for name numbers, a birth date otherwise).", "चुने अंक के लिए दोनों का आवश्यक विवरण भरें (नाम-अंक के लिए नाम, अन्यथा जन्म तिथि)।") + "</p>"; return; }
        var p = NS.pairs && NS.pairs[Math.min(x, y) + "-" + Math.max(x, y)];
        $("pairOut").innerHTML = '<div class="keybox">' + L("Individual A: ", "व्यक्ति A: ") + archLink(x) + " &nbsp; " + L("Individual B: ", "व्यक्ति B: ") + archLink(y) + (p ? "<p><b>" + t(p.title) + "</b><br>" + t(p.core) + "</p>" : "") + '<a class="btn gold" href="#/pair/' + x + "/" + y + '">' + L("Open pairing chapter ", "जोड़ी अध्याय खोलें ") + x + y + "</a></div>";
      }
      ["aName", "aDob", "bName", "bDob", "basis", "relType"].forEach(function (id) { $(id).onchange = pair; });
      document.querySelectorAll("[data-dim]").forEach(function (el) { el.onchange = function () { var i = el.dataset.dim; (c.dim[i] = c.dim[i] || {}).l = +el.value; U.save(); summary(); }; });
      document.querySelectorAll("[data-note]").forEach(function (el) { el.oninput = function () { var i = el.dataset.note; (c.dim[i] = c.dim[i] || {}).n = el.value; U.save(); }; });
      $("cmpClear").onclick = function () { if (confirm(lr("Clear both people and all eight ratings?", "दोनों का विवरण और आठों आकलन मिटाएँ?"))) { S.compare = {}; U.save(); NS.go(); } };
      pair(); summary();
    } };
  };

  /* ---------- emotional trigger diary ---------- */
  var STAGES = [["Situation", "परिस्थिति", "What happened? Facts only.", "क्या हुआ? केवल तथ्य।"], ["Interpretation", "व्याख्या", "What did I tell myself it meant?", "मैंने इसका क्या अर्थ निकाला?"], ["Emotion", "भावना", "Name it and rate intensity 1-10.", "नाम दें और तीव्रता 1-10 लिखें।"], ["Reaction", "प्रतिक्रिया", "What did I do or say?", "मैंने क्या किया या कहा?"], ["Consequence", "परिणाम", "What followed for me and the other person?", "मुझ पर और दूसरे पर क्या असर हुआ?"], ["Alternative response", "वैकल्पिक प्रतिक्रिया", "What could I try next time?", "अगली बार क्या आज़मा सकते हैं?"]];
  V.trigger = function () {
    var h = head(L("PRACTICE LAB", "अभ्यास लैब"), L("Emotional trigger mapping diary", "भावनात्मक ट्रिगर मानचित्र डायरी"), L("Situation → Interpretation → Emotion → Reaction → Consequence → Alternative response. Analyse at least three situations.", "परिस्थिति → व्याख्या → भावना → प्रतिक्रिया → परिणाम → वैकल्पिक प्रतिक्रिया। कम से कम तीन स्थितियों का विश्लेषण करें।"));
    h += '<details class="check"><summary>' + L("Worked example", "हल किया उदाहरण") + "</summary>" + U.table([["Stage", "चरण"], ["Example", "उदाहरण"]], [[["Situation", "परिस्थिति"], ["Partner does not respond to a message", "साथी संदेश का उत्तर नहीं देता"]], [["Interpretation", "व्याख्या"], ["I am being ignored", "मेरी अनदेखी हो रही है"]], [["Emotion", "भावना"], ["Anxiety or frustration", "चिंता या झुँझलाहट"]], [["Reaction", "प्रतिक्रिया"], ["Repeated messages or withdrawal", "बार-बार संदेश या दूरी बना लेना"]], [["Consequence", "परिणाम"], ["Communication tension", "संवाद में तनाव"]], [["Alternative response", "वैकल्पिक प्रतिक्रिया"], ["Clarify expectations and communicate calmly", "अपेक्षाएँ स्पष्ट करें और शांति से बात करें"]]]) + "</details>";
    h += '<fieldset><legend>' + L("New entry", "नई प्रविष्टि") + "</legend>" + STAGES.map(function (s, i) { return "<label class='blk'>" + (i + 1) + ". " + L(s[0], s[1]) + '<textarea id="tg' + i + '" rows="2" placeholder="' + L(s[2], s[3]) + '"></textarea></label>'; }).join("") + '<button class="btn gold" id="tgAdd">' + L("Save entry", "प्रविष्टि सहेजें") + '</button></fieldset><p class="note">' + L("If a situation involves fear, threats, violence or abuse, do not treat it as a communication exercise. Seek safety and qualified help.", "यदि स्थिति में भय, धमकी, हिंसा या दुर्व्यवहार हो, तो इसे संवाद अभ्यास न मानें। सुरक्षा और योग्य सहायता लें।") + '</p><div id="tgList"></div>';
    return { html: h, after: function () {
      function draw() {
        $("tgList").innerHTML = "<h3>" + L("My entries", "मेरी प्रविष्टियाँ") + " (" + S.triggers.length + ")</h3>" + S.triggers.map(function (e, k) { return '<div class="casebox"><b>' + (k + 1) + ".</b> " + esc(e.date) + U.table(null, STAGES.map(function (s, i) { return [lr(s[0], s[1]), e.v[i] || "–"]; })) + '<button class="btn danger" data-del="' + k + '">' + L("Delete", "हटाएँ") + "</button></div>"; }).join("") + (S.triggers.length ? '<button class="btn" data-print>' + L("Print / save as PDF", "प्रिंट / PDF सहेजें") + "</button>" : "");
        document.querySelectorAll("[data-del]").forEach(function (b) { b.onclick = function () { if (confirm(lr("Delete this entry?", "यह प्रविष्टि हटाएँ?"))) { S.triggers.splice(+b.dataset.del, 1); U.save(); draw(); } }; });
      }
      $("tgAdd").onclick = function () {
        var v = STAGES.map(function (s, i) { return $("tg" + i).value.trim(); });
        if (!v[0]) { alert(lr("Describe the situation first.", "पहले परिस्थिति लिखें।")); return; }
        S.triggers.push({ date: new Date().toLocaleDateString("en-IN"), v: v }); U.save();
        STAGES.forEach(function (s, i) { $("tg" + i).value = ""; }); draw();
      };
      draw();
    } };
  };

  /* ---------- positive-negative assessment matrix ---------- */
  var ACOLS = [["Trait", "गुण"], ["Numerical association", "अंक संबंध"], ["Positive expression", "सकारात्मक अभिव्यक्ति"], ["Challenging expression", "चुनौतीपूर्ण अभिव्यक्ति"], ["Frequency observed", "कितनी बार देखा"], ["Triggering circumstances", "ट्रिगर परिस्थितियाँ"], ["Impact on relationships", "संबंधों पर प्रभाव"], ["Self-awareness (1-5)", "आत्म-जागरूकता (1-5)"], ["Improvement opportunity", "सुधार का अवसर"], ["Action plan", "कार्य योजना"]];
  V.assess = function () {
    var opts = (NS.traits || []).map(function (x, i) { return [U.raw(x.n), i]; }).sort(function (a, b) { return a[0].localeCompare(b[0]); });
    var h = head(L("PRACTICE LAB", "अभ्यास लैब"), L("Positive-negative personality assessment matrix", "सकारात्मक-नकारात्मक व्यक्तित्व आकलन मैट्रिक्स"), L("Choose at least five traits from your own profile. Record what you actually observe across the ten dimensions.", "अपनी प्रोफ़ाइल से कम से कम पाँच गुण चुनें। दस आयामों में वही लिखें जो वास्तव में देखते हैं।"));
    h += '<div class="form"><label>' + L("Add from the trait dictionary", "गुण कोश से जोड़ें") + '<select id="asPick"><option value="">…</option>' + opts.map(function (o) { return '<option value="' + o[1] + '">' + esc(o[0]) + "</option>"; }).join("") + '</select></label><button class="btn" id="asBlank">' + L("Add a blank trait", "खाली गुण जोड़ें") + '</button></div><div id="asList"></div><div class="tools"><button class="btn gold" data-print>' + L("Print / save the report as PDF", "रिपोर्ट प्रिंट / PDF सहेजें") + "</button></div>";
    return { html: h, after: function () {
      function draw() {
        $("asList").innerHTML = S.assess.map(function (r, k) { return "<fieldset><legend>" + (k + 1) + ". " + esc(r[0] || lr("New trait", "नया गुण")) + '</legend><div class="form">' + ACOLS.map(function (c, i) { return "<label>" + t(c) + '<textarea rows="2" data-r="' + k + '" data-c="' + i + '">' + esc(r[i] || "") + "</textarea></label>"; }).join("") + '</div><button class="btn danger" data-del="' + k + '">' + L("Remove trait", "गुण हटाएँ") + "</button></fieldset>"; }).join("") || '<p class="muted">' + L("No traits added yet.", "अभी कोई गुण नहीं जोड़ा गया।") + "</p>";
        document.querySelectorAll("[data-r]").forEach(function (el) { el.oninput = function () { S.assess[+el.dataset.r][+el.dataset.c] = el.value; U.save(); }; });
        document.querySelectorAll("[data-del]").forEach(function (b) { b.onclick = function () { if (confirm(lr("Remove this trait and its notes?", "यह गुण और इसके नोट हटाएँ?"))) { S.assess.splice(+b.dataset.del, 1); U.save(); draw(); } }; });
      }
      $("asPick").onchange = function () { var x = NS.traits[+this.value]; if (!x) return; S.assess.push([U.raw(x.n), x.a.join(", "), U.raw(x.p), U.raw(x.x), "", "", U.raw(x.r), "", U.raw(x.i), ""]); U.save(); this.value = ""; draw(); };
      $("asBlank").onclick = function () { S.assess.push(["", "", "", "", "", "", "", "", "", ""]); U.save(); draw(); };
      draw();
    } };
  };

  /* ---------- report builder ---------- */
  var IND = [["Personal details", "व्यक्तिगत विवरण"], ["Numerological calculation sheet", "अंक गणना पत्र"], ["Core personality archetype", "मूल व्यक्तित्व आर्कटाइप"], ["Dominant characteristics", "प्रमुख विशेषताएँ"], ["Positive traits", "सकारात्मक गुण"], ["Challenging traits", "चुनौतीपूर्ण गुण"], ["Emotional profile", "भावनात्मक प्रोफ़ाइल"], ["Communication profile", "संवाद प्रोफ़ाइल"], ["Behavioural trigger profile", "व्यवहार ट्रिगर प्रोफ़ाइल"], ["Relationship expectations", "संबंध अपेक्षाएँ"], ["Strengths to develop", "विकसित करने योग्य शक्तियाँ"], ["Challenges to manage", "प्रबंधन योग्य चुनौतियाँ"], ["Practical recommendations", "व्यावहारिक सुझाव"], ["Personal growth roadmap", "निजी विकास रोडमैप"]];
  var REL = [["Individual A numerological profile", "व्यक्ति A की अंक प्रोफ़ाइल"], ["Individual B numerological profile", "व्यक्ति B की अंक प्रोफ़ाइल"], ["Personality comparison", "व्यक्तित्व तुलना"], ["Positive relationship characteristics", "संबंध की सकारात्मक विशेषताएँ"], ["Challenging behavioural differences", "चुनौतीपूर्ण व्यवहार अंतर"], ["Emotional needs comparison", "भावनात्मक आवश्यकता तुलना"], ["Communication analysis", "संवाद विश्लेषण"], ["Relationship stress areas", "संबंध तनाव क्षेत्र"], ["Compatibility assessment", "अनुकूलता आकलन"], ["Accept and Ignore recommendations", "स्वीकारने और अनदेखा करने के सुझाव"], ["Adjustment requirements", "समायोजन आवश्यकताएँ"], ["Behavioural improvement requirements", "व्यवहार सुधार आवश्यकताएँ"], ["30-day improvement roadmap", "30-दिन सुधार रोडमैप"], ["Final relationship assessment", "अंतिम संबंध आकलन"]];
  function bullets(a) { return (a || []).map(function (x) { return "• " + U.raw(x); }).join("\n"); }
  function names(a) { return (a || []).map(function (x) { return "• " + U.raw(x[0]) + ": " + U.raw(x[1]); }).join("\n"); }
  function calcSheet(name, dob) {
    var r = profileNumbers(name, dob), out = [];
    if (r.v) out.push(lr("Mulank (Vedic): ", "मूलांक (वैदिक): ") + r.v.mulank + " [" + r.v.mulankSteps + "]", lr("Bhagyank (Vedic): ", "भाग्यांक (वैदिक): ") + r.v.bhagyank + " [" + r.v.bhagyankSteps + "]");
    if (r.py.lifePath) out.push(lr("Life Path (Pythagorean): ", "लाइफ पाथ (पाइथागोरियन): ") + mm(r.py.lifePath));
    if (r.ch.compound) out.push(lr("Name number (Chaldean): ", "नामांक (कैल्डियन): ") + r.ch.compound + " → " + r.ch.root, lr("Expression (Pythagorean): ", "एक्सप्रेशन (पाइथागोरियन): ") + mm(r.py.expression));
    return out.join("\n");
  }
  function draftInd(n, name, dob) {
    var a = NS.num[n];
    return [lr("Name: ", "नाम: ") + name + "\n" + lr("Date of birth: ", "जन्म तिथि: ") + dob, calcSheet(name, dob), n + " · " + U.raw(a.name) + "\n" + U.raw(a.essence), bullets(a.keywords), names(a.pos), names(a.neg), U.raw(a.emo.need) + "\n" + U.raw(a.emo.challenge), U.raw(a.comm.style) + "\n" + U.raw(a.comm.listening), bullets(a.emo.triggers), names(a.relation), names(a.pos.slice(0, 5)), names(a.neg.slice(0, 5)), bullets(a.manage.practise), lr("Awareness:\nAcceptance:\nAdjustment:\nGrowth:", "जागरूकता:\nस्वीकृति:\nसमायोजन:\nविकास:")];
  }
  function draftRel(x, y, A, B) {
    var a = NS.num[x], b = NS.num[y], p = NS.pairs[Math.min(x, y) + "-" + Math.max(x, y)], c = S.compare, sa = (NS.srm || {})[x], sb = (NS.srm || {})[y];
    var dims = NS.dimensions.map(function (d, i) { var v = (c.dim || {})[i] || {}; return v.l || v.n ? "• " + U.raw(d.name) + ": " + U.raw(LEVELS[v.l || 0]) + (v.n ? " (" + v.n + ")" : "") : ""; }).filter(Boolean).join("\n");
    var na = (A.name || "A") + " (" + x + ")", nb = (B.name || "B") + " (" + y + ")";
    function two(f) { return sa && sb ? na + ":\n" + f(sa) + "\n\n" + nb + ":\n" + f(sb) : ""; }
    var own = (S.decisions || []);
    function picked(ids) { return own.filter(function (d) { return ids.indexOf(d.c) >= 0; }).map(function (d) { return "• [" + d.c + "] " + d.s; }).join("\n"); }
    var month = (NS.PHASES || []).map(function (ph) { return lr("Days ", "दिन ") + ph.from + "–" + (ph.from + ph.tasks.length - 1) + ": " + U.raw(ph.name); }).join("\n");
    return [
      (A.name || "A") + "\n" + calcSheet(A.name, A.dob) + "\n\n" + x + " · " + U.raw(a.name) + "\n" + U.raw(a.essence),
      (B.name || "B") + "\n" + calcSheet(B.name, B.dob) + "\n\n" + y + " · " + U.raw(b.name) + "\n" + U.raw(b.essence),
      U.raw(p.core) + "\n" + bullets(p.contrast),
      bullets(p.shared),
      bullets(p.friction),
      U.raw(p.emotional) + "\n" + na + ": " + U.raw(a.emo.need) + "\n" + nb + ": " + U.raw(b.emo.need),
      U.raw(p.communication) + "\n" + na + ": " + U.raw(a.comm.style) + "\n" + nb + ": " + U.raw(b.comm.style),
      dims ? lr("Eight-dimension observations:", "आठ आयाम अवलोकन:") + "\n" + dims : lr("Complete the eight-dimension assessment from what both people report.", "दोनों के बताए अनुभव से आठ-आयाम आकलन पूरा करें।"),
      U.raw(p.trust) + "\n" + lr("There is no score and no verdict. Strengths and conversation areas:", "कोई अंक या निर्णय नहीं। शक्तियाँ और बातचीत के क्षेत्र:"),
      picked(["accept", "ignore"]) || two(function (s) { return lr("Possible to accept:", "स्वीकारने योग्य:") + "\n" + bullets(s.four.accept) + "\n" + lr("Possible to ignore:", "अनदेखा करने योग्य:") + "\n" + bullets(s.four.ignore); }),
      picked(["adjust"]) || bullets(p.adjust),
      picked(["work", "safety"]) || two(function (s) { return bullets(s.four.work); }),
      month + "\n\n" + lr("Measurable objectives:", "मापने योग्य लक्ष्य:") + "\n" + ((S.plan30 && S.plan30.goals) || []).filter(Boolean).join("\n"),
      U.raw(p.growth) + "\n" + lr("These are themes for reflection, not a verdict. Conclusions:", "ये आत्मचिंतन के विषय हैं, निर्णय नहीं। निष्कर्ष:")
    ];
  }
  function reportDoc(title, heads, vals) {
    return "<h1>" + esc(title) + "</h1><p><i>NUMEROSUTRAS · " + esc(lr("Instructor", "प्रशिक्षक")) + ": " + esc(U.raw(NS.instructor.name)) + "</i></p>" + heads.map(function (h, i) { return "<h2>" + (i + 1) + ". " + t(h) + "</h2><p>" + esc(vals[i] || "").replace(/\n/g, "<br>") + "</p>"; }).join("") + "<hr><p><small>" + t(NS.boundary) + "</small></p><p><small>" + t(NS.credit) + "</small></p>";
  }
  V.report = function () {
    var R = S.report; R.mode = R.mode || "ind"; R.basis = R.basis || "mulank"; R.p = R.p || {}; R.ind = R.ind || []; R.rel = R.rel || [];
    var heads = R.mode === "ind" ? IND : REL, vals = R[R.mode], c = S.compare;
    var h = head(L("PRACTICE LAB", "अभ्यास लैब"), L("Professional report builder", "पेशेवर रिपोर्ट निर्माता"), L("Create a draft from the library, then rewrite every chapter around the real person’s observations. A library draft is not yet a report.", "पुस्तकालय से प्रारूप बनाएँ, फिर हर अध्याय वास्तविक व्यक्ति के अवलोकन के अनुसार लिखें। पुस्तकालय का प्रारूप अभी रिपोर्ट नहीं है।")) + privacy();
    h += '<div class="chips"><button class="chip wide ' + (R.mode === "ind" ? "on" : "") + '" data-mode="ind">' + L("Individual personality report", "व्यक्तिगत व्यक्तित्व रिपोर्ट") + '</button><button class="chip wide ' + (R.mode === "rel" ? "on" : "") + '" data-mode="rel">' + L("Relationship report", "संबंध रिपोर्ट") + "</button></div>";
    h += '<div class="form noprint">' + (R.mode === "ind" ? field(L("Name (English letters)", "नाम (अंग्रेज़ी अक्षर)"), "rName", "text", R.p.name) + field(L("Date of birth", "जन्म तिथि"), "rDob", "date", R.p.dob) : '<p>' + L("Uses the two people entered in the ", "इसमें ") + '<a href="#/compare">' + L("two-person assessment", "दो-व्यक्ति आकलन") + "</a>" + L(".", " के दोनों व्यक्ति लिए जाते हैं।") + " <b>" + esc((c.a && c.a.name || "A") + " & " + (c.b && c.b.name || "B")) + "</b></p>") + "<label>" + L("Primary number", "मुख्य अंक") + '<select id="rBasis">' + BASIS.map(function (b) { return '<option value="' + b[0] + '">' + t(b[1]) + "</option>"; }).join("") + '</select></label><button class="btn gold" id="rDraft">' + L("Create draft from library", "पुस्तकालय से प्रारूप बनाएँ") + "</button></div>";
    h += '<div class="report noprint">' + heads.map(function (x, i) { var v = vals[i] || ""; return "<label>" + (i + 1) + ". " + t(x) + '<textarea data-ch="' + i + '" rows="' + Math.min(12, Math.max(3, v.split("\n").length + 1)) + '">' + esc(v) + "</textarea></label>"; }).join("") + "</div>";
    h += '<div class="tools"><button class="btn gold" id="rPrint">' + L("Print / save as PDF", "प्रिंट / PDF सहेजें") + '</button><button class="btn" id="rWord">' + L("Download as Word file", "Word फ़ाइल डाउनलोड करें") + '</button><button class="btn danger" id="rClear">' + L("Clear report", "रिपोर्ट मिटाएँ") + '</button></div><div id="printArea" class="printonly"></div>';
    return { html: h, after: function () {
      $("rBasis").value = R.basis;
      var title = R.mode === "ind" ? lr("Personality Analysis Report", "व्यक्तित्व विश्लेषण रिपोर्ट") : lr("Relationship Analysis Report", "संबंध विश्लेषण रिपोर्ट");
      document.querySelectorAll("[data-mode]").forEach(function (b) { b.onclick = function () { R.mode = b.dataset.mode; U.save(); NS.go(); }; });
      document.querySelectorAll("[data-ch]").forEach(function (el) { el.oninput = function () { vals[+el.dataset.ch] = el.value; U.save(); }; });
      if ($("rName")) { $("rName").onchange = function () { R.p.name = this.value; U.save(); }; $("rDob").onchange = function () { R.p.dob = this.value; U.save(); }; }
      $("rBasis").onchange = function () { R.basis = this.value; U.save(); };
      $("rDraft").onclick = function () {
        var d = null;
        if (R.mode === "ind") { var n = numberBy(R.basis, R.p.name, R.p.dob); if (n && NS.num[n]) d = draftInd(n, R.p.name || "", R.p.dob || ""); }
        else { var A = c.a || {}, B = c.b || {}, x = numberBy(R.basis, A.name, A.dob), y = numberBy(R.basis, B.name, B.dob); if (x && y) d = draftRel(x, y, A, B); }
        if (!d) { alert(lr("Fill in the details needed for the chosen primary number first.", "पहले चुने मुख्य अंक के लिए आवश्यक विवरण भरें।")); return; }
        if (vals.some(function (v) { return v; }) && !confirm(lr("Replace the text now in the chapters with a new draft?", "अध्यायों का वर्तमान पाठ नए प्रारूप से बदलें?"))) return;
        R[R.mode] = d; U.save(); NS.go();
      };
      $("rPrint").onclick = function () { window.print(); };
      window.onbeforeprint = function () { var el = $("printArea"); if (el) el.innerHTML = reportDoc(title, heads, vals); };
      window.onbeforeprint();
      document.querySelectorAll("[data-ch]").forEach(function (el) { el.addEventListener("change", window.onbeforeprint); });
      $("rWord").onclick = function () {
        var doc = '<html><head><meta charset="utf-8"><style>body{font-family:Calibri,Nirmala UI,sans-serif}h1,h2{color:#2e2a6e}</style></head><body>' + reportDoc(title, heads, vals) + "</body></html>";
        NS.download("NUMEROSUTRAS-report.doc", "application/msword", "﻿" + doc);
      };
      $("rClear").onclick = function () { if (confirm(lr("Clear all chapters of this report?", "इस रिपोर्ट के सभी अध्याय मिटाएँ?"))) { R[R.mode] = []; U.save(); NS.go(); } };
    } };
  };

  /* ---------- growth planner ---------- */
  var PLAN = [["strength", 5, ["Positive traits to strengthen", "मज़बूत करने योग्य सकारात्मक गुण"]], ["challenge", 5, ["Challenging tendencies to manage", "प्रबंधन योग्य चुनौतीपूर्ण प्रवृत्तियाँ"]], ["trig", 3, ["Emotional triggers", "भावनात्मक ट्रिगर"]], ["comm", 3, ["Communication improvements", "संवाद सुधार"]], ["rel", 3, ["Relationship management recommendations", "संबंध प्रबंधन सुझाव"]]];
  var LEVEL4 = [["Awareness: identify the trait, the pattern and its impact", "जागरूकता: गुण, प्रतिरूप और प्रभाव पहचानें"], ["Acceptance: accept differences, avoid labels, see the other view", "स्वीकृति: अंतर स्वीकारें, लेबल न लगाएँ, दूसरे का दृष्टिकोण देखें"], ["Adjustment: modify expectations, communicate, regulate, set boundaries", "समायोजन: अपेक्षाएँ बदलें, संवाद करें, भाव संभालें, सीमाएँ तय करें"], ["Growth: strengthen positives, reduce repeated reactions, build cooperation", "विकास: सकारात्मक गुण बढ़ाएँ, दोहराई प्रतिक्रियाएँ घटाएँ, सहयोग बनाएँ"]];
  V.planner = function () {
    var G = S.plan; G.items = G.items || {}; G.lv = G.lv || []; G.week = G.week || [];
    var h = head(L("PRACTICE LAB", "अभ्यास लैब"), L("Behavioural transformation and growth planner", "व्यवहार रूपांतरण और विकास योजनाकार"), L("Use it for each person alongside the 30-day planner. Write small, observable actions you can check each week.", "यह कैपस्टोन परियोजना C है। छोटे, दिखने वाले कदम लिखें जिन्हें हर सप्ताह जाँच सकें।"));
    h += PLAN.map(function (p) { var a = G.items[p[0]] || []; var rows = ""; for (var i = 0; i < p[1]; i++) rows += '<input class="wideinput" data-g="' + p[0] + '" data-i="' + i + '" value="' + esc(a[i] || "") + '" aria-label="' + t(p[2]) + " " + (i + 1) + '" placeholder="' + (i + 1) + '">'; return "<fieldset><legend>" + t(p[2]) + " (" + p[1] + ")</legend>" + rows + "</fieldset>"; }).join("");
    h += "<h3>" + L("Four-level transformation model", "चार-स्तरीय रूपांतरण मॉडल") + "</h3>" + LEVEL4.map(function (l, i) { return "<label class='blk'><b>" + (i + 1) + ". " + t(l) + '</b><textarea rows="3" data-lv="' + i + '">' + esc(G.lv[i] || "") + "</textarea></label>"; }).join("");
    h += "<h3>" + L("Weekly check-ins", "साप्ताहिक समीक्षा") + "</h3>" + [1, 2, 3, 4, 5, 6].map(function (w) { return "<label class='blk'>" + L("Week ", "सप्ताह ") + w + '<textarea rows="2" data-wk="' + (w - 1) + '" placeholder="' + L("What I tried, what changed, what I will adjust", "क्या आज़माया, क्या बदला, आगे क्या सुधारेंगे") + '">' + esc(G.week[w - 1] || "") + "</textarea></label>"; }).join("") + '<button class="btn gold" data-print>' + L("Print / save as PDF", "प्रिंट / PDF सहेजें") + "</button>";
    return { html: h, after: function () {
      document.querySelectorAll("[data-g]").forEach(function (el) { el.oninput = function () { (G.items[el.dataset.g] = G.items[el.dataset.g] || [])[+el.dataset.i] = el.value; U.save(); }; });
      document.querySelectorAll("[data-lv]").forEach(function (el) { el.oninput = function () { G.lv[+el.dataset.lv] = el.value; U.save(); }; });
      document.querySelectorAll("[data-wk]").forEach(function (el) { el.oninput = function () { G.week[+el.dataset.wk] = el.value; U.save(); }; });
    } };
  };
})();

;
/* ===== tools2.js ===== */
/* Tools specific to this course: decision engine, emotional needs, conflict map, 30-day planner, compound library, stress causes, cases. */
(function () {
  var U = NS.ui, S = U.S, t = U.t, L = U.L, lr = U.lr, esc = U.esc, V = NS.views, head = V.head;
  function $(id) { return document.getElementById(id); }
  function each(sel, fn) { Array.prototype.forEach.call(document.querySelectorAll(sel), fn); }
  function act(id) { return NS.actions.filter(function (a) { return a.id === id; })[0]; }
  var SAFE = { id: "safety", name: ["Safety first", "सुरक्षा पहले"] };
  function actName(id) { return t((id === "safety" ? SAFE : act(id) || SAFE).name); }
  function privacy() { return '<p class="small muted">' + L("Everything you type stays on this device. Use another person’s details only with their consent.", "आप जो लिखते हैं वह इसी उपकरण पर रहता है। किसी अन्य व्यक्ति का विवरण उसकी सहमति से ही प्रयोग करें।") + "</p>"; }
  function printBtn() { return '<button class="btn gold" data-print>' + L("Print / save as PDF", "प्रिंट / PDF सहेजें") + "</button>"; }
  var SAFETY_TEXT = ["Do not treat this as a communication exercise and do not classify it as something to accept or ignore. Put safety first: contact someone you trust and qualified help; in immediate danger call your local emergency number. Do not confront the person or start a joint exercise if that could raise the risk.", "इसे संवाद अभ्यास न मानें और इसे स्वीकारने या अनदेखा करने की श्रेणी में न रखें। सुरक्षा पहले रखें: किसी भरोसेमंद व्यक्ति और योग्य सहायता से संपर्क करें; तत्काल खतरे में अपने स्थानीय आपातकालीन नंबर पर फ़ोन करें। यदि जोखिम बढ़ सकता है तो सामना न करें और साझा अभ्यास शुरू न करें।"];

  /* ---------- Accept / Ignore / Adjust / Work Upon ---------- */
  var QS = [
    ["safety", ["Does it involve fear, violence, threats, forced or controlling behaviour, stalking or humiliation?", "क्या इसमें भय, हिंसा, धमकी, ज़बरदस्ती या नियंत्रण, पीछा करना या अपमानित करना शामिल है?"]],
    ["work", ["Does it harm someone, or involve dishonesty, disrespect, repeated broken promises, neglect or refusal to take responsibility?", "क्या इससे किसी को हानि होती है, या इसमें बेईमानी, अनादर, बार-बार टूटे वादे, उपेक्षा या ज़िम्मेदारी से इनकार है?"]],
    ["adjust", ["Does it repeatedly affect shared life: time, money, duties, family, communication or an important need of either person?", "क्या यह बार-बार साझा जीवन पर असर डालता है: समय, धन, कर्तव्य, परिवार, संवाद या किसी की महत्वपूर्ण ज़रूरत?"]],
    ["accept", ["Is it a lasting part of the other person’s temperament, interests or identity?", "क्या यह दूसरे व्यक्ति के स्वभाव, रुचि या पहचान का स्थायी हिस्सा है?"]]
  ];
  V.decide = function () {
    var D = S.decisions || (S.decisions = []);
    var h = head(L("SIGNATURE TOOL", "विशिष्ट टूल"), L("Accept · Ignore · Adjust · Work Upon", "स्वीकारें · अनदेखा · समायोजन · काम करें"), L("Describe one specific behaviour, answer the questions honestly, and the tool shows a starting category with its next step. You make the final judgement.", "एक ठोस व्यवहार लिखें, प्रश्नों के सच्चे उत्तर दें; टूल आरंभिक श्रेणी और अगला कदम दिखाएगा। अंतिम निर्णय आपका है।")) + privacy();
    h += "<label class='blk'>" + L("The behaviour or issue (facts only)", "व्यवहार या मुद्दा (केवल तथ्य)") + '<input class="wideinput" id="dcText" maxlength="200"></label>' +
      QS.map(function (q, i) { return "<fieldset><legend>" + (i + 1) + ". " + t(q[1]) + '</legend><label><input type="radio" name="dq' + i + '" value="y"> ' + L("Yes", "हाँ") + '</label><label><input type="radio" name="dq' + i + '" value="n"> ' + L("No", "नहीं") + "</label></fieldset>"; }).join("") +
      '<div id="dcOut" aria-live="polite"></div><div class="tools"><button class="btn gold" id="dcGo">' + L("Show the category", "श्रेणी दिखाएँ") + '</button><a class="btn" href="#/practice">' + L("Practise on ready situations", "तैयार स्थितियों पर अभ्यास") + '</a></div><div id="dcList"></div>';
    return { html: h, after: function () {
      function draw() {
        var cols = NS.actions.map(function (a) { return a.id; }).concat(["safety"]);
        $("dcList").innerHTML = D.length ? "<h3>" + L("My decision matrix", "मेरा निर्णय मैट्रिक्स") + '</h3><div class="grid">' + cols.map(function (c) { var rows = D.map(function (d, i) { return d.c === c ? "<li>" + esc(d.s) + ' <button class="chip" data-del="' + i + '" aria-label="' + L("Delete", "हटाएँ") + '">×</button></li>' : ""; }).join(""); return rows ? '<div class="pcard"><h4>' + actName(c) + "</h4><ul>" + rows + "</ul></div>" : ""; }).join("") + "</div>" + printBtn() : "";
        each("[data-del]", function (b) { b.onclick = function () { D.splice(+b.dataset.del, 1); U.save(); draw(); }; });
      }
      $("dcGo").onclick = function () {
        var s = $("dcText").value.trim(); if (!s) { $("dcOut").innerHTML = '<p class="note">' + L("Describe the behaviour first.", "पहले व्यवहार लिखें।") + "</p>"; return; }
        var ans = QS.map(function (q, i) { var c = document.querySelector('input[name="dq' + i + '"]:checked'); return c ? c.value : ""; });
        var cat = "", i;
        for (i = 0; i < QS.length; i++) {
          if (!ans[i]) { $("dcOut").innerHTML = '<p class="note">' + L("Please answer question ", "कृपया प्रश्न ") + (i + 1) + L(".", " का उत्तर दें।") + "</p>"; return; }
          if (ans[i] === "y") { cat = QS[i][0]; break; }
        }
        cat = cat || "ignore";
        var a = act(cat);
        $("dcOut").innerHTML = cat === "safety" ? '<div class="note"><h3>' + actName(cat) + "</h3><p>" + t(SAFETY_TEXT) + "</p></div>" : '<div class="keybox"><h3>' + t(a.name) + "</h3><p>" + t(a.text) + "</p><p><b>" + L("Typical examples: ", "आम उदाहरण: ") + "</b>" + t(a.ex) + "</p></div>";
        D.push({ s: s, c: cat }); U.save(); draw();
      };
      draw();
    } };
  };
  V.practice = function () {
    var list = NS.situations || [];
    var h = head(L("PRACTICE", "अभ्यास"), L("Classify the situation", "स्थिति को श्रेणी दें"), L("Choose a category, then compare your reasoning. Context can change an answer, so read the reason.", "श्रेणी चुनें, फिर अपने तर्क से मिलाएँ। संदर्भ से उत्तर बदल सकता है, इसलिए कारण पढ़ें।")) + '<p id="prScore" class="formula" aria-live="polite"></p>' +
      list.map(function (x, i) { return "<fieldset id='pr" + i + "'><legend>" + (i + 1) + ". " + t(x.s) + '</legend><div class="chips">' + ["accept", "ignore", "adjust", "work", "safety"].map(function (c) { return '<button class="chip wide" data-s="' + i + '" data-c="' + c + '">' + actName(c) + "</button>"; }).join("") + '</div><div class="why" hidden></div></fieldset>'; }).join("");
    return { html: h, after: function () {
      var got = {};
      each("[data-s]", function (b) { b.onclick = function () {
        var i = +b.dataset.s, x = list[i], ok = b.dataset.c === x.c, f = $("pr" + i), w = f.querySelector(".why");
        if (got[i] === undefined) got[i] = ok;
        f.className = ok ? "ok" : "no"; w.hidden = false;
        w.innerHTML = (ok ? "✓ " : "✗ " + L("Suggested: ", "सुझाई श्रेणी: ") + actName(x.c) + ". ") + t(x.why);
        var k = Object.keys(got), r = k.filter(function (j) { return got[j]; }).length;
        $("prScore").textContent = lr("First-try matches: ", "पहले प्रयास में मेल: ") + r + " / " + k.length;
      }; });
    } };
  };

  /* ---------- couple emotional needs ---------- */
  var NEEDS = [["appreciation", ["Appreciation", "सराहना"]], ["affection", ["Affection", "स्नेह"]], ["reassurance", ["Reassurance", "आश्वासन"]], ["independence", ["Independence", "स्वतंत्रता"]], ["recognition", ["Recognition", "पहचान"]], ["stability", ["Stability", "स्थिरता"]], ["space", ["Personal space", "निजी स्थान"]], ["trust", ["Trust", "विश्वास"]], ["expression", ["Emotional expression", "भाव अभिव्यक्ति"]]];
  NS.NEEDS = NEEDS;
  V.needs = function () {
    var N = S.needs || (S.needs = { a: {}, b: {}, n: {} });
    function sel(k, f) { var v = N[k][f] || 0; return '<select data-who="' + k + '" data-f="' + f + '" aria-label="' + k.toUpperCase() + " " + f + '"><option value="0">–</option>' + [1, 2, 3, 4, 5].map(function (i) { return "<option" + (v == i ? " selected" : "") + ">" + i + "</option>"; }).join("") + "</select>"; }
    var h = head(L("PRACTICE LAB", "अभ्यास लैब"), L("Couple emotional needs comparison", "युगल भावनात्मक आवश्यकता तुलना"), L("Each person rates for themselves how important a need is and how well it is met now (1 low, 5 high). The three largest gaps become conversation topics. Numbers are not used to guess these ratings.", "हर व्यक्ति स्वयं बताए कि ज़रूरत कितनी महत्वपूर्ण है और अभी कितनी पूरी होती है (1 कम, 5 अधिक)। तीन सबसे बड़े अंतर बातचीत के विषय बनते हैं। ये आकलन अंकों से अनुमान नहीं किए जाते।")) + privacy() +
      '<div class="form"><label>' + L("Number theme for A (optional)", "A का अंक विषय (वैकल्पिक)") + '<select data-num="a"></select></label><label>' + L("Number theme for B (optional)", "B का अंक विषय (वैकल्पिक)") + '<select data-num="b"></select></label></div><div class="tw"><table><tr><th>' + L("Need", "आवश्यकता") + "</th><th>A: " + L("important", "महत्व") + "</th><th>A: " + L("met", "पूर्ति") + "</th><th>B: " + L("important", "महत्व") + "</th><th>B: " + L("met", "पूर्ति") + "</th></tr>" +
      NEEDS.map(function (n) { return "<tr><th>" + t(n[1]) + "</th><td>" + sel("a", n[0] + "I") + "</td><td>" + sel("a", n[0] + "M") + "</td><td>" + sel("b", n[0] + "I") + "</td><td>" + sel("b", n[0] + "M") + "</td></tr>"; }).join("") + '</table></div><div id="ndOut" aria-live="polite"></div>' + printBtn();
    return { html: h, after: function () {
      function draw() {
        var gaps = [];
        ["a", "b"].forEach(function (k) { NEEDS.forEach(function (n) { var i = +N[k][n[0] + "I"] || 0, m = +N[k][n[0] + "M"] || 0; if (i && m && i > m) gaps.push({ k: k, n: n, g: i - m, i: i }); }); });
        gaps.sort(function (x, y) { return y.g - x.g || y.i - x.i; });
        var h = "<h3>" + L("Largest unmet expectations", "सबसे बड़ी अधूरी अपेक्षाएँ") + "</h3>" + (gaps.length ? "<ol>" + gaps.slice(0, 3).map(function (g) { var s = NS.srm && NS.srm[N.n[g.k]]; return "<li><b>" + g.k.toUpperCase() + " · " + t(g.n[1]) + "</b> (" + L("gap ", "अंतर ") + g.g + ")" + (s ? '<br><span class="small">' + L("Number theme to discuss: ", "चर्चा के लिए अंक विषय: ") + t(s.needs[g.n[0]]) + "</span>" : "") + "</li>"; }).join("") + "</ol>" : '<p class="muted">' + L("No gap yet. Rate both columns for at least one need.", "अभी कोई अंतर नहीं। कम से कम एक ज़रूरत के दोनों कॉलम भरें।") + "</p>");
        $("ndOut").innerHTML = h;
      }
      each("[data-num]", function (s) { var k = s.dataset.num; s.innerHTML = '<option value="">–</option>' + [1, 2, 3, 4, 5, 6, 7, 8, 9].map(function (i) { return "<option>" + i + "</option>"; }).join(""); s.value = N.n[k] || ""; s.onchange = function () { N.n[k] = s.value; U.save(); draw(); }; });
      each("[data-who]", function (s) { s.onchange = function () { N[s.dataset.who][s.dataset.f] = +s.value; U.save(); draw(); }; });
      draw();
    } };
  };

  /* ---------- staged diaries: emotional stress map and conflict map ---------- */
  function diary(key, kick, title, lead, stages, extra) {
    S[key] = S[key] || [];
    var E = S[key];
    var h = head(kick, title, lead) + (extra || "") + privacy() + "<fieldset><legend>" + L("New entry", "नई प्रविष्टि") + "</legend>" + stages.map(function (s, i) { return "<label class='blk'>" + (i + 1) + ". " + t(s[0]) + '<textarea id="dy' + i + '" rows="2" placeholder="' + t(s[1]) + '"></textarea></label>'; }).join("") + '<button class="btn gold" id="dyAdd">' + L("Save entry", "प्रविष्टि सहेजें") + '</button><p id="dyMsg" class="small" aria-live="polite"></p></fieldset><div class="note">' + t(SAFETY_TEXT) + " " + L("This applies whenever fear, threats, violence or control are present.", "यह तब लागू है जब भय, धमकी, हिंसा या नियंत्रण हो।") + '</div><div id="dyList"></div>';
    return { html: h, after: function () {
      function draw() {
        $("dyList").innerHTML = "<h3>" + L("My entries", "मेरी प्रविष्टियाँ") + " (" + E.length + ")</h3>" + E.map(function (e, k) { return '<div class="casebox"><b>' + (k + 1) + ".</b> " + esc(e.date) + U.table(null, stages.map(function (s, i) { return [U.raw(s[0]), e.v[i] || "–"]; })) + '<button class="btn danger" data-del="' + k + '">' + L("Delete", "हटाएँ") + "</button></div>"; }).join("") + (E.length ? printBtn() : "");
        each("[data-del]", function (b) { b.onclick = function () { if (confirm(lr("Delete this entry?", "यह प्रविष्टि हटाएँ?"))) { E.splice(+b.dataset.del, 1); U.save(); draw(); } }; });
      }
      $("dyAdd").onclick = function () {
        var v = stages.map(function (s, i) { return $("dy" + i).value.trim(); });
        if (!v[0]) { $("dyMsg").textContent = lr("Fill in the first step.", "पहला चरण भरें।"); return; }
        E.push({ date: new Date().toLocaleDateString("en-IN"), v: v }); U.save(); $("dyMsg").textContent = lr("Saved.", "सहेजा गया।");
        stages.forEach(function (s, i) { $("dy" + i).value = ""; }); draw();
      };
      draw();
    } };
  }
  V.emap = function () {
    return diary("triggers", L("PRACTICE LAB", "अभ्यास लैब"), L("Emotional stress map", "भावनात्मक तनाव मानचित्र"), L("Unmet need → Interpretation → Emotional reaction → Behaviour → Relationship impact → Better response", "अधूरी ज़रूरत → व्याख्या → भावनात्मक प्रतिक्रिया → व्यवहार → संबंध पर असर → बेहतर प्रतिक्रिया"), [
      [["Unmet need", "अधूरी ज़रूरत"], ["Example: desire for appreciation", "उदाहरण: सराहना की चाह"]], [["Personal interpretation", "निजी व्याख्या"], ["My contribution is not valued. Is this fact or assumption?", "मेरे योगदान की कद्र नहीं। यह तथ्य है या अनुमान?"]], [["Emotional reaction", "भावनात्मक प्रतिक्रिया"], ["Name it and rate 1–10", "नाम दें और 1–10 आँकें"]], [["Behaviour", "व्यवहार"], ["Withdrawal, criticism, something else", "दूरी, आलोचना या कुछ और"]], [["Relationship impact", "संबंध पर असर"], ["What gap followed?", "आगे क्या दूरी बनी?"]], [["Better response next time", "अगली बार बेहतर प्रतिक्रिया"], ["A clear request in one sentence", "एक वाक्य में स्पष्ट अनुरोध"]]]);
  };
  V.trigger = V.emap;
  V.conflict = function () {
    var q = [[["What happened?", "क्या हुआ?"], ["Facts only", "केवल तथ्य"]], [["What did Individual A expect?", "व्यक्ति A की क्या अपेक्षा थी?"], ["In A’s own words", "A के अपने शब्दों में"]], [["What did Individual B expect?", "व्यक्ति B की क्या अपेक्षा थी?"], ["In B’s own words", "B के अपने शब्दों में"]], [["What was the trigger?", "ट्रिगर क्या था?"], ["The exact moment", "ठीक वह क्षण"]], [["What was the emotional response?", "भावनात्मक प्रतिक्रिया क्या थी?"], ["Of each person", "दोनों की"]], [["How did each react?", "दोनों ने कैसे प्रतिक्रिया दी?"], ["Words and actions", "शब्द और कर्म"]], [["What intensified it?", "किससे टकराव बढ़ा?"], ["Tone, timing, old issues", "लहजा, समय, पुरानी बातें"]], [["What could have prevented escalation?", "बढ़ने से क्या रोक सकता था?"], ["One or two things", "एक-दो बातें"]], [["What needs to be said?", "क्या कहा जाना ज़रूरी है?"], ["A non-blaming sentence", "बिना दोष वाला वाक्य"]], [["What practical change is required?", "कौन-सा व्यावहारिक बदलाव चाहिए?"], ["Who does what by when", "कौन, क्या, कब तक"]]];
    return diary("conflicts", L("PRACTICE LAB", "अभ्यास लैब"), L("Ten-question conflict map", "दस-प्रश्न टकराव मानचित्र"), L("Map one argument at a time, after both people have calmed down.", "दोनों के शांत होने के बाद एक बार में एक बहस का मानचित्र बनाएँ।"), q);
  };

  /* ---------- 30-day plan (Framework 4) ---------- */
  var PHASES = [
    { from: 1, name: ["Awareness: identify stress patterns", "जागरूकता: तनाव प्रतिरूप पहचानें"], tasks: [["Write the three most repeated stress points as facts", "सबसे अधिक दोहराए जाने वाले तीन तनाव तथ्य रूप में लिखें"], ["Notice your own first reaction once today", "आज एक बार अपनी पहली प्रतिक्रिया पर ध्यान दें"], ["Observe how each of you starts a conversation", "देखें कि आप दोनों बात कैसे शुरू करते हैं"], ["Record one emotional trigger in the stress map", "तनाव मानचित्र में एक ट्रिगर दर्ज करें"], ["List expectations you never said aloud", "वे अपेक्षाएँ लिखें जो कभी कही नहीं"], ["Note one moment that went well and why", "एक अच्छा क्षण और उसका कारण लिखें"], ["Summarise the week’s patterns without blaming", "बिना दोष के सप्ताह के प्रतिरूप सारांशित करें"]] },
    { from: 8, name: ["Acceptance: reduce unnecessary friction", "स्वीकृति: अनावश्यक घर्षण घटाएँ"], tasks: [["List five differences between you", "आप दोनों के पाँच अंतर लिखें"], ["Mark which of them are harmless", "देखें इनमें कौन-से हानिरहित हैं"], ["Let one small harmless habit pass without comment", "एक छोटी हानिरहित आदत पर टिप्पणी न करें"], ["Appreciate one difference aloud", "एक अंतर की खुलकर सराहना करें"], ["Ask about one interest of the other person", "दूसरे की एक रुचि के बारे में पूछें"], ["Replace one criticism with a question", "एक आलोचना की जगह प्रश्न पूछें"], ["Review: where did friction reduce?", "समीक्षा: घर्षण कहाँ घटा?"]] },
    { from: 15, name: ["Adjustment: improve communication and habits", "समायोजन: संवाद और आदतें सुधारें"], tasks: [["Discuss one expectation at an agreed calm time", "तय शांत समय पर एक अपेक्षा पर बात करें"], ["Listen fully, then repeat back what you heard", "पूरा सुनें, फिर सुनी बात दोहराएँ"], ["Agree one personal boundary each", "दोनों एक-एक निजी सीमा तय करें"], ["Agree who does which household or shared task", "तय करें कौन-सा साझा काम कौन करेगा"], ["Agree a signal and length for a calm pause", "शांत विराम का संकेत और अवधि तय करें"], ["Say one need as a clear request", "एक ज़रूरत स्पष्ट अनुरोध के रूप में कहें"], ["Check the week’s agreements together", "सप्ताह की सहमतियाँ साथ जाँचें"]] },
    { from: 22, name: ["Growth: review progress and sustain it", "विकास: प्रगति की समीक्षा और निरंतरता"], tasks: [["Rate each agreed behaviour from 1 to 5", "हर तय व्यवहार को 1 से 5 आँकें"], ["Name one change you noticed in the other person", "दूसरे में दिखा एक बदलाव बताएँ"], ["Own one thing you still need to improve", "एक बात स्वीकारें जो आपको अभी सुधारनी है"], ["Discuss one unresolved issue calmly", "एक अनसुलझे मुद्दे पर शांति से बात करें"], ["Keep the habit that helped most; plan how", "सबसे सहायक आदत बनाए रखने की योजना बनाएँ"], ["Decide whether qualified support would help", "सोचें कि क्या योग्य सहायता उपयोगी होगी"], ["Share appreciation for the effort made", "किए गए प्रयास की सराहना करें"], ["Set a goal for the next month", "अगले महीने का लक्ष्य तय करें"], ["Complete the review and the next check-in date", "समीक्षा पूरी करें और अगली तारीख तय करें"]] }
  ];
  NS.PHASES = PHASES;
  V.plan30 = function () {
    var G = S.plan30 || (S.plan30 = { done: {}, note: {}, goals: [], start: "" });
    var h = head(L("PRACTICE LAB", "अभ्यास लैब"), L("30-day relationship improvement planner", "30-दिन संबंध सुधार योजनाकार"), L("One small action a day. From day 15 to day 30, also practise your agreed behaviour changes: listening, respectful words and shared responsibility.", "प्रतिदिन एक छोटा कदम। दिन 15 से 30 तक तय व्यवहार परिवर्तन भी करें: सुनना, सम्मानजनक शब्द और साझा ज़िम्मेदारी।")) + '<div class="note">' + L("Where there is fear, violence, threats or control, do not use a couple plan. Get safety help first.", "भय, हिंसा, धमकी या नियंत्रण हो तो युगल योजना न अपनाएँ। पहले सुरक्षा सहायता लें।") + "</div>" + privacy() +
      '<div class="form"><label>' + L("Start date", "आरंभ तिथि") + '<input type="date" id="pStart" value="' + esc(G.start) + '"></label></div><fieldset><legend>' + L("Three measurable behaviour objectives", "तीन मापने योग्य व्यवहार लक्ष्य") + "</legend>" + [0, 1, 2].map(function (i) { return '<input class="wideinput" data-goal="' + i + '" value="' + esc(G.goals[i] || "") + '" aria-label="goal ' + (i + 1) + '" placeholder="' + L("Example: on 5 days a week, listen to the end before replying", "उदाहरण: सप्ताह में 5 दिन, उत्तर से पहले पूरी बात सुनूँ") + '">'; }).join("") + '</fieldset><p id="pCount" class="formula"></p>' +
      PHASES.map(function (p) { return "<h3>" + L("Days ", "दिन ") + p.from + "–" + (p.from + p.tasks.length - 1) + " · " + t(p.name) + "</h3>" + p.tasks.map(function (task, i) { var d = p.from + i; return '<div class="check"><label class="chk"><input type="checkbox" data-day="' + d + '"' + (G.done[d] ? " checked" : "") + "> <b>" + d + ".</b> " + t(task) + '</label><input class="wideinput" data-dn="' + d + '" value="' + esc(G.note[d] || "") + '" aria-label="note ' + d + '" placeholder="' + L("What happened?", "क्या हुआ?") + '"></div>'; }).join(""); }).join("") + printBtn() + ' <a class="btn" href="#/planner">' + L("Personal growth planner", "निजी विकास योजनाकार") + "</a>";
    return { html: h, after: function () {
      function count() { $("pCount").textContent = lr("Days done: ", "पूरे दिन: ") + Object.keys(G.done).filter(function (k) { return G.done[k]; }).length + " / 30"; }
      $("pStart").onchange = function () { G.start = this.value; U.save(); };
      each("[data-goal]", function (el) { el.oninput = function () { G.goals[+el.dataset.goal] = el.value; U.save(); }; });
      each("[data-day]", function (el) { el.onchange = function () { G.done[el.dataset.day] = el.checked; U.save(); count(); }; });
      each("[data-dn]", function (el) { el.oninput = function () { G.note[el.dataset.dn] = el.value; U.save(); }; });
      count();
    } };
  };

  /* ---------- reference libraries ---------- */
  V.compound = function () {
    var C = NS.compound || {};
    return { html: head(L("REFERENCE", "संदर्भ"), L("Chaldean compound number library", "कैल्डियन संयुक्त अंक पुस्तकालय"), L("The compound number is the total before reduction. Read these traditional themes as reflection prompts, never as warnings.", "संयुक्त अंक घटाने से पहले का योग है। इन पारंपरिक विषयों को चेतावनी नहीं, आत्मचिंतन के संकेत मानें।")) + U.table([["Compound → root", "संयुक्त → मूल"], ["Traditional theme", "पारंपरिक विषय"]], Object.keys(C).map(function (k) { return [k + " → " + NS.engine.reduce(+k), C[k]]; })) };
  };
  var CAUSE_CATS = { emotional: ["Emotional", "भावनात्मक"], communication: ["Communication", "संवाद"], behaviour: ["Behaviour", "व्यवहार"], lifestyle: ["Lifestyle", "जीवनशैली"], responsibility: ["Responsibility", "ज़िम्मेदारी"], independence: ["Independence", "स्वतंत्रता"], family: ["Family", "परिवार"], decisions: ["Decision-making", "निर्णय"], money: ["Money", "धन"], commitment: ["Commitment", "प्रतिबद्धता"] };
  V.causes = function () {
    var h = head(L("MANUAL 3", "पुस्तिका 3"), L("100 common causes of relationship stress", "संबंध तनाव के 100 सामान्य कारण"), L("For each cause: what to understand, a first step and a usual starting category.", "हर कारण के लिए: क्या समझें, पहला कदम और आम आरंभिक श्रेणी।")) + '<div class="form"><label>' + L("Group", "समूह") + '<select id="csCat"><option value="">' + L("All", "सभी") + "</option>" + Object.keys(CAUSE_CATS).map(function (k) { return '<option value="' + k + '">' + t(CAUSE_CATS[k]) + "</option>"; }).join("") + "</select></label></div><div id=\"csOut\"></div>";
    return { html: h, after: function () {
      function draw() {
        var c = $("csCat").value, rows = (NS.causes || []).map(function (x, i) { return [x, i]; }).filter(function (r) { return !c || r[0][0] === c; });
        $("csOut").innerHTML = rows.map(function (r) { var x = r[0]; return '<details class="check"><summary><b>' + (r[1] + 1) + ". " + t(x[1]) + '</b> <span class="tag">' + actName(x[4]) + "</span></summary>" + U.dl([[["What to understand", "क्या समझें"], x[2]], [["First step", "पहला कदम"], x[3]]]) + "</details>"; }).join("");
      }
      $("csCat").onchange = draw; draw();
    } };
  };
  V.cases = function () {
    return { html: head(L("PRACTICE", "अभ्यास"), L("Illustrative couple case studies", "उदाहरणात्मक युगल केस स्टडी"), L("All people are invented. Write your own answers before opening the discussion.", "सभी पात्र काल्पनिक हैं। चर्चा खोलने से पहले अपने उत्तर लिखें।")) + (NS.cases || []).map(function (c, i) { return '<details class="check"><summary><b>' + (i + 1) + ". " + t(c.title) + '</b> <span class="tag">' + c.a + " × " + c.b + '</span></summary><div class="reading"><p class="kick dark">' + t(c.area) + "</p><p>" + t(c.story) + "</p>" + U.list(c.questions, "ol") + "<details class='check'><summary>" + L("Reveal the discussion", "चर्चा देखें") + "</summary><p>" + t(c.analysis) + '</p></details><p><a href="#/pair/' + c.a + "/" + c.b + '">' + L("Open pairing chapter ", "जोड़ी अध्याय खोलें ") + c.a + c.b + "</a></p></div></details>"; }).join("") };
  };
})();

;
/* ===== grid147.js ===== */
/* Adds the Pythagorean-style 1-4-7 birth-date grid beside the Lo Shu lab. The two grids are never mixed. */
(function () {
  var U = NS.ui, S = U.S, t = U.t, L = U.L, lr = U.lr, esc = U.esc, V = NS.views, E = NS.engine;
  var LAYOUT = [1, 4, 7, 2, 5, 8, 3, 6, 9];
  var PL = [[["Physical plane", "शारीरिक तल"], [1, 4, 7]], [["Emotional plane", "भावनात्मक तल"], [2, 5, 8]], [["Mental plane", "मानसिक तल"], [3, 6, 9]]];
  function counts(dob) {
    var p = E.parseDate(dob); if (!p) return null;
    var c = {}; for (var i = 1; i <= 9; i++) c[i] = 0;
    p.digits.forEach(function (d) { if (d) c[d]++; });
    return c;
  }
  function grid(c) { return '<div class="loshu" role="img" aria-label="1-4-7 grid">' + LAYOUT.map(function (n) { return '<div class="' + (c[n] ? "has" : "none") + '"><b>' + (c[n] ? new Array(c[n] + 1).join(n) : "–") + "</b><small>" + n + "</small></div>"; }).join("") + "</div>"; }
  function one(label, c) {
    return "<div><h4>" + label + "</h4>" + grid(c) + U.table([["Plane", "तल"], ["Filled", "भरे"]], PL.map(function (p) { return [U.raw(p[0]) + " (" + p[1].join("-") + ")", p[1].filter(function (n) { return c[n]; }).length + " / 3"]; })) + "</div>";
  }
  var base = V.loshu;
  V.loshu = function () {
    var page = base();
    page.html += "<hr><h2>" + L("Pythagorean-style grid (1-4-7 / 2-5-8 / 3-6-9)", "पाइथागोरियन-शैली ग्रिड (1-4-7 / 2-5-8 / 3-6-9)") + '</h2><p class="note">' + L("This is a different tradition from Lo Shu. Only birth-date digits are placed (zero ignored). Plane names vary between schools. Never carry a Lo Shu reading into this grid.", "यह लो शू से अलग परंपरा है। केवल जन्म तिथि के अंक रखे जाते हैं (शून्य छोड़कर)। तलों के नाम मत अनुसार बदलते हैं। लो शू की व्याख्या इस ग्रिड पर न लगाएँ।") + '</p><div class="form"><label>' + L("Second person’s date of birth (for comparison, with consent)", "तुलना के लिए दूसरे व्यक्ति की जन्म तिथि (सहमति से)") + '<input type="date" id="gDob2" value="' + esc(S.dob2 || "") + '"></label></div><div id="g147" aria-live="polite"></div>';
    var after = page.after;
    page.after = function () {
      after();
      var a = document.getElementById("lDob"), b = document.getElementById("gDob2");
      function draw() {
        S.dob2 = b.value; U.save();
        var x = counts(a.value), y = counts(b.value), h = "";
        if (x) {
          h = '<div class="grid2">' + one(L("Individual A (date above)", "व्यक्ति A (ऊपर की तिथि)"), x) + (y ? one(L("Individual B", "व्यक्ति B"), y) : "") + "</div>";
          if (y) {
            var both = [], only = [], none = [];
            for (var n = 1; n <= 9; n++) (x[n] && y[n] ? both : x[n] || y[n] ? only : none).push(n);
            h += U.table([["Comparison", "तुलना"], ["Numbers", "अंक"]], [[["In both grids", "दोनों ग्रिड में"], both.join(", ") || "–"], [["In one grid only (discuss differences)", "केवल एक ग्रिड में (अंतर पर चर्चा)"], only.join(", ") || "–"], [["In neither", "किसी में नहीं"], none.join(", ") || "–"]]) + '<p class="small muted">' + L("These are discussion themes, not evidence of how the relationship will go.", "ये चर्चा के विषय हैं, संबंध कैसा चलेगा इसका प्रमाण नहीं।") + "</p>";
          }
        } else h = '<p class="muted">' + L("Enter the date of birth above to draw this grid.", "यह ग्रिड बनाने के लिए ऊपर जन्म तिथि लिखें।") + "</p>";
        document.getElementById("g147").innerHTML = h;
      }
      a.addEventListener("change", draw); b.onchange = draw; draw();
    };
    return page;
  };
})();

;
/* ===== methodlabs.js ===== */
/* Four method labs (Vedic, Pythagorean, Chaldean, Lo Shu): engine rules, calculator with working,
   generated calculation drills, scored assessment, couple assessment, and a four-method comparison sheet.
   Drill and test answers always come from the same engine as the calculators. */
(function () {
  var U = NS.ui, S = U.S, E = NS.engine, t = U.t, L = U.L, lr = U.lr, esc = U.esc, V = NS.views, head = V.head;
  function $(id) { return document.getElementById(id); }
  function each(sel, fn) { Array.prototype.forEach.call(document.querySelectorAll(sel), fn); }
  function privacy() { return '<p class="small muted">' + L("Everything you type stays on this device. Use another person’s details only with their consent.", "आप जो लिखते हैं वह इसी उपकरण पर रहता है। किसी अन्य व्यक्ति का विवरण उसकी सहमति से ही प्रयोग करें।") + "</p>"; }
  function store() { return S.mlab || (S.mlab = { in: {}, drill: {}, test: {}, obs: {} }); }
  function arch(n) { var a = NS.num && NS.num[n]; return n + (a ? " · " + U.raw(a.name) : ""); }
  function archLink(n) { return '<a href="#/arch/' + n + '">' + esc(arch(n)) + "</a>"; }
  function mm(p) { return !p ? "–" : p.master !== p.root ? p.master + " / " + p.root : String(p.root); }

  /* ---------- engine additions ---------- */
  function maturity(name, dob) { var r = E.pythagorean(name, dob); if (!r.lifePath || !r.expression) return null; var sum = r.lifePath.root + r.expression.root; return { total: sum, root: E.reduce(sum), steps: r.lifePath.root + " + " + r.expression.root + " = " + E.chain(sum) }; }
  var GRID147 = [[1, 4, 7], [2, 5, 8], [3, 6, 9]];
  E.maturity = maturity;

  var M = {
    vedic: { name: ["Vedic", "वैदिक"], icon: "☉", needs: "dob",
      about: ["Birth Number (Mulank), Destiny Number (Bhagyank) and Name Number (Namank, with Chaldean letter values), each linked with a planet.", "मूलांक, भाग्यांक और नामांक (कैल्डियन अक्षर मान से), हर अंक एक ग्रह से जुड़ा।"],
      rules: [["Mulank", "मूलांक", "Day of birth reduced to 1–9", "जन्म के दिन को 1–9 तक घटाएँ"], ["Bhagyank", "भाग्यांक", "All digits of the full date added and reduced", "पूरी तिथि के सभी अंक जोड़कर घटाएँ"], ["Namank", "नामांक", "Chaldean letter values of the name, added and reduced", "नाम के कैल्डियन अक्षर मान जोड़कर घटाएँ"], ["Planets", "ग्रह", "1 Sun, 2 Moon, 3 Jupiter, 4 Rahu, 5 Mercury, 6 Venus, 7 Ketu, 8 Saturn, 9 Mars", "1 सूर्य, 2 चन्द्र, 3 गुरु, 4 राहु, 5 बुध, 6 शुक्र, 7 केतु, 8 शनि, 9 मंगल"]] },
    pythagorean: { name: ["Pythagorean", "पाइथागोरियन"], icon: "△", needs: "both",
      about: ["Life Path from the date; Expression, Soul Urge and Personality from the name; Birthday and Maturity numbers; the 1-4-7 birth-date grid.", "तिथि से लाइफ पाथ; नाम से एक्सप्रेशन, सोल अर्ज और पर्सनैलिटी; बर्थडे और मैच्योरिटी अंक; 1-4-7 जन्म-तिथि ग्रिड।"],
      rules: [["Letter values", "अक्षर मान", "A–I = 1–9, J–R = 1–9, S–Z = 1–8", "A–I = 1–9, J–R = 1–9, S–Z = 1–8"], ["Life Path", "लाइफ पाथ", "Reduce day, month and year separately, add, reduce; 11, 22, 33 are noted", "दिन, महीना, वर्ष अलग घटाएँ, जोड़ें, घटाएँ; 11, 22, 33 दर्ज करें"], ["Expression / Soul Urge / Personality", "एक्सप्रेशन / सोल अर्ज / पर्सनैलिटी", "All letters / vowels A E I O U / consonants (Y counted as consonant)", "सभी अक्षर / स्वर A E I O U / व्यंजन (Y व्यंजन)"], ["Maturity", "मैच्योरिटी", "Life Path root + Expression root, reduced", "लाइफ पाथ मूल + एक्सप्रेशन मूल, घटाएँ"]] },
    chaldean: { name: ["Chaldean", "कैल्डियन"], icon: "𝕮", needs: "name",
      about: ["Name number with word-by-word compound numbers and roots, using the Chaldean letter chart.", "कैल्डियन अक्षर तालिका से शब्द-दर-शब्द संयुक्त और मूल अंक सहित नामांक।"],
      rules: [["Letter values", "अक्षर मान", "1: A I J Q Y · 2: B K R · 3: C G L S · 4: D M T · 5: E H N X · 6: U V W · 7: O Z · 8: F P", "1: A I J Q Y · 2: B K R · 3: C G L S · 4: D M T · 5: E H N X · 6: U V W · 7: O Z · 8: F P"], ["No 9", "9 नहीं", "No letter is given 9; a total can still reduce to 9", "किसी अक्षर का मान 9 नहीं; योग फिर भी 9 बन सकता है"], ["Compound and root", "संयुक्त और मूल", "Compound = unreduced total; root = reduced total", "संयुक्त = बिना घटाया योग; मूल = घटाया योग"], ["Which name", "कौन-सा नाम", "State the spelling in everyday use; record any other spelling separately", "रोज़ प्रयोग की वर्तनी लिखें; दूसरी वर्तनी अलग दर्ज करें"]] },
    loshu: { name: ["Lo Shu", "लो शू"], icon: "▦", needs: "dob",
      about: ["The 4-9-2 / 3-5-7 / 8-1-6 grid: present, missing and repeated numbers, planes, and the optional Kua number.", "4-9-2 / 3-5-7 / 8-1-6 ग्रिड: उपस्थित, अनुपस्थित, दोहराए अंक, तल और वैकल्पिक कुआ अंक।"],
      rules: [["Layout", "विन्यास", "Rows 4 9 2 / 3 5 7 / 8 1 6", "पंक्तियाँ 4 9 2 / 3 5 7 / 8 1 6"], ["Filling", "भरना", "Birth-date digits; zero ignored. Adding Mulank, Bhagyank or Kua is optional and must be recorded", "जन्म तिथि के अंक; शून्य छोड़ें। मूलांक, भाग्यांक या कुआ जोड़ना वैकल्पिक है, दर्ज करें"], ["Kua", "कुआ", "y = reduced digit sum of birth year; male 11 − y, female y + 4; reduce; 5 becomes 2 (male) or 8 (female)", "y = जन्म वर्ष के अंकों का घटाया योग; पुरुष 11 − y, महिला y + 4; घटाएँ; 5 हो तो 2 (पुरुष) या 8 (महिला)"], ["Care", "सावधानी", "A missing number is not a defect; schools differ", "अनुपस्थित अंक दोष नहीं; मत भिन्न हैं"]] }
  };
  NS.METHODLABS = M;
  var IDS = ["vedic", "pythagorean", "chaldean", "loshu"];

  /* ---------- calculators ---------- */
  function letterRows(words) { return words.map(function (w) { return '<div class="letters"><b>' + esc(w.word) + "</b> " + w.cells.map(function (c) { return "<span>" + c[0] + "<small>" + c[1] + "</small></span>"; }).join("") + " <em>= " + w.total + " → " + w.root + "</em></div>"; }).join(""); }
  function grid(layout, counts) { return '<div class="loshu" role="img" aria-label="grid">' + layout.map(function (n) { return '<div class="' + (counts[n] ? "has" : "none") + '"><b>' + (counts[n] ? new Array(counts[n] + 1).join(n) : "–") + "</b><small>" + n + "</small></div>"; }).join("") + "</div>"; }
  var RES = [["Component", "घटक"], ["Number", "अंक"], ["Working", "गणना"]];

  /* Returns {rows, extra, keys}; keys = [[label, number]] used for the couple comparison. */
  function compute(id, p, opt) {
    var rows = [], keys = [], extra = "";
    if (id === "vedic") {
      var v = E.vedic(p.dob), c = E.chaldean(p.name);
      if (!v) return null;
      rows.push([["Mulank", "मूलांक"], v.mulank + " · " + U.raw(E.PLANET[v.mulank]), v.mulankSteps], [["Bhagyank", "भाग्यांक"], v.bhagyank + " · " + U.raw(E.PLANET[v.bhagyank]), v.bhagyankSteps]);
      keys.push([["Mulank", "मूलांक"], v.mulank], [["Bhagyank", "भाग्यांक"], v.bhagyank]);
      if (c.compound) { rows.push([["Namank", "नामांक"], c.root + " · " + U.raw(E.PLANET[c.root]), c.steps]); keys.push([["Namank", "नामांक"], c.root]); extra = letterRows(c.words); }
    } else if (id === "pythagorean") {
      var r = E.pythagorean(p.name, p.dob), has = !!r.expression;
      if (!has && !r.lifePath) return null;
      if (r.lifePath) { rows.push([["Life Path", "लाइफ पाथ"], mm(r.lifePath), r.lifePath.steps], [["Birthday", "बर्थडे"], r.birthday, E.chain(E.parseDate(p.dob).d)]); keys.push([["Life Path", "लाइफ पाथ"], r.lifePath.root]); }
      if (has) {
        [["expression", ["Expression", "एक्सप्रेशन"]], ["soul", ["Soul Urge", "सोल अर्ज"]], ["personality", ["Personality", "पर्सनैलिटी"]]].forEach(function (k) { if (r[k[0]]) { rows.push([k[1], mm(r[k[0]]), r[k[0]].steps]); keys.push([k[1], r[k[0]].root]); } });
        var mt = maturity(p.name, p.dob); if (mt) rows.push([["Maturity", "मैच्योरिटी"], mt.root, mt.steps]);
        extra = letterRows(r.words);
      }
      var d = E.parseDate(p.dob);
      if (d) { var cn = {}; for (var i = 1; i <= 9; i++) cn[i] = 0; d.digits.forEach(function (x) { if (x) cn[x]++; }); extra += "<h4>" + L("1-4-7 birth-date grid", "1-4-7 जन्म-तिथि ग्रिड") + "</h4>" + grid([1, 4, 7, 2, 5, 8, 3, 6, 9], cn) + '<p class="small">' + [["Physical", "शारीरिक"], ["Emotional", "भावनात्मक"], ["Mental", "मानसिक"]].map(function (nm, k) { return t(nm) + " (" + GRID147[k].join("-") + "): " + GRID147[k].filter(function (x) { return cn[x]; }).length + "/3"; }).join(" · ") + "</p>"; }
    } else if (id === "chaldean") {
      var ch = E.chaldean(p.name);
      if (!ch.compound) return null;
      ch.words.forEach(function (w) { rows.push([w.word, w.total + " → " + w.root, w.cells.map(function (x) { return x[1]; }).join("+")]); });
      rows.push([["Full name", "पूरा नाम"], ch.compound + " → " + ch.root, ch.steps]);
      keys.push([["Name root", "नाम मूल"], ch.root]);
      if (ch.words.length > 1) keys.push([["First name root", "पहले नाम का मूल"], ch.words[0].root]);
      extra = letterRows(ch.words) + (NS.compound && NS.compound[ch.compound] ? '<div class="keybox"><b>' + L("Compound ", "संयुक्त अंक ") + ch.compound + ":</b> " + t(NS.compound[ch.compound]) + "</div>" : "");
      if (p.alt) { var a2 = E.chaldean(p.alt); if (a2.compound) extra += "<p><b>" + L("Other spelling: ", "दूसरी वर्तनी: ") + "</b>" + esc(p.alt) + " = " + a2.compound + " → " + a2.root + '</p><p class="small muted">' + L("The comparison shows arithmetic only. This course does not advise changing a name to repair a relationship.", "यह तुलना केवल गणित दिखाती है। यह कोर्स संबंध सुधारने के लिए नाम बदलने की सलाह नहीं देता।") + "</p>"; }
    } else {
      var g = E.loshu(p.dob, opt || {});
      if (!g) return null;
      rows.push([["Missing", "अनुपस्थित"], g.missing.join(", ") || "–", ""], [["Repeated", "दोहराए"], g.repeated.map(function (n) { return n + "×" + g.counts[n]; }).join(", ") || "–", ""]);
      g.planes.forEach(function (pl) { var info = NS.planes && NS.planes[pl.key]; rows.push([info ? info.name : pl.key, pl.have + " / 3", pl.cells.join("-")]); });
      var kua = opt && opt.kua ? E.kua(p.dob, opt.kua) : null;
      if (kua) rows.push([["Kua", "कुआ"], kua.value, lr("year root ", "वर्ष मूल ") + kua.yearRoot + (kua.early ? lr(" · early-year birth: many schools use the previous year", " · वर्षारंभ जन्म: अनेक मत पिछला वर्ष लेते हैं") : "")]);
      extra = grid(E.LAYOUT, g.counts) + '<p class="small muted">' + (g.added.length ? L("Added: ", "जोड़े गए: ") + esc(g.added.map(function (a) { return a[0] + " " + a[1]; }).join(", ")) : L("Birth-date digits only.", "केवल जन्म तिथि के अंक।")) + "</p>";
      for (var n = 1; n <= 9; n++) { var x = NS.loshu && NS.loshu[n]; if (x) extra += '<details class="check"><summary><b>' + n + "</b> · " + (g.counts[n] === 0 ? L("missing", "अनुपस्थित") : g.counts[n] === 1 ? L("present once", "एक बार") : L("repeated ", "दोहराया ") + g.counts[n] + "×") + "</summary><p>" + t(g.counts[n] === 0 ? x.missing : g.counts[n] === 1 ? x.present : x.repeat) + "</p></details>"; }
      keys = g.counts;
    }
    return { rows: rows, extra: extra, keys: keys };
  }
  NS.methodCompute = compute;

  /* ---------- generated drill questions ---------- */
  var NAMES = ["ANITA SHARMA", "ROHAN MEHTA", "KAVITA JOSHI", "IMRAN QURESHI", "NEHA VERMA", "ARJUN NAIR", "PRIYA DAS", "SANDEEP SINGH", "MEERA IYER", "VIKRAM RAO", "FARAH KHAN", "DEEPAK GUPTA", "SUNITA PATEL", "JOSEPH THOMAS", "RITU BANSAL"];
  function ri(n) { return Math.floor(Math.random() * n); }
  function rdate() { var y = 1965 + ri(45), m = 1 + ri(12), d = 1 + ri(28); return y + "-" + (m < 10 ? "0" : "") + m + "-" + (d < 10 ? "0" : "") + d; }
  function nice(iso) { var p = iso.split("-"); return p[2] + "-" + p[1] + "-" + p[0]; }
  function q(en, hi, ans, why) { return { q: [en, hi], a: String(ans), why: why }; }
  var GEN = {
    vedic: [
      function () { var d = rdate(), v = E.vedic(d); return q("Mulank for " + nice(d) + "?", nice(d) + " का मूलांक?", v.mulank, v.mulankSteps); },
      function () { var d = rdate(), v = E.vedic(d); return q("Bhagyank for " + nice(d) + "?", nice(d) + " का भाग्यांक?", v.bhagyank, v.bhagyankSteps); },
      function () { var n = NAMES[ri(NAMES.length)], c = E.chaldean(n); return q("Namank (Chaldean root) for " + n + "?", n + " का नामांक (कैल्डियन मूल)?", c.root, c.steps); }],
    pythagorean: [
      function () { var d = rdate(), r = E.pythagorean("", d); return q("Life Path root (single digit) for " + nice(d) + "?", nice(d) + " का लाइफ पाथ मूल (एक अंक)?", r.lifePath.root, r.lifePath.steps); },
      function () { var n = NAMES[ri(NAMES.length)], r = E.pythagorean(n, ""); return q("Expression root for " + n + "?", n + " का एक्सप्रेशन मूल?", r.expression.root, r.expression.steps); },
      function () { var n = NAMES[ri(NAMES.length)], r = E.pythagorean(n, ""); return q("Soul Urge root (vowels) for " + n + "?", n + " का सोल अर्ज मूल (स्वर)?", r.soul.root, r.soul.steps); },
      function () { var n = NAMES[ri(NAMES.length)], r = E.pythagorean(n, ""); return q("Personality root (consonants) for " + n + "?", n + " का पर्सनैलिटी मूल (व्यंजन)?", r.personality.root, r.personality.steps); }],
    chaldean: [
      function () { var n = NAMES[ri(NAMES.length)], c = E.chaldean(n); return q("Chaldean compound total for " + n + "?", n + " का कैल्डियन संयुक्त अंक?", c.compound, c.words.map(function (w) { return w.word + " = " + w.total; }).join(" ; ")); },
      function () { var n = NAMES[ri(NAMES.length)].split(" ")[0], c = E.chaldean(n); return q("Chaldean root for the name " + n + "?", n + " नाम का कैल्डियन मूल अंक?", c.root, c.words[0].cells.map(function (x) { return x[0] + "=" + x[1]; }).join(", ") + " → " + c.steps); },
      function () { var k = Object.keys(E.CH)[ri(26)]; return q("Chaldean value of the letter " + k + "?", "अक्षर " + k + " का कैल्डियन मान?", E.CH[k], k + " = " + E.CH[k]); }],
    loshu: [
      function () { var d = rdate(), g = E.loshu(d, {}), n = 1 + ri(9); return q("Lo Shu (date digits only), " + nice(d) + ": how many times does " + n + " appear?", "लो शू (केवल तिथि अंक), " + nice(d) + ": अंक " + n + " कितनी बार है?", g.counts[n], nice(d)); },
      function () { var d = rdate(), g = E.loshu(d, {}); return q("How many of the numbers 1–9 are missing in the Lo Shu grid of " + nice(d) + " (date digits only)?", nice(d) + " के लो शू ग्रिड (केवल तिथि अंक) में 1–9 में से कितने अंक अनुपस्थित हैं?", g.missing.length, lr("Missing: ", "अनुपस्थित: ") + g.missing.join(", ")); },
      function () { var d = rdate(), g = E.loshu(d, {}), p = g.planes[ri(3)]; return q("In " + nice(d) + ", how many cells of the row " + p.cells.join("-") + " are filled?", nice(d) + " में पंक्ति " + p.cells.join("-") + " के कितने खाने भरे हैं?", p.have, p.cells.join("-")); },
      function () { var d = rdate(), sex = ri(2) ? "f" : "m", k = E.kua(d, sex); return q("Kua for birth year " + d.slice(0, 4) + " using the traditional " + (sex === "f" ? "female" : "male") + " formula (no early-year adjustment)?", "जन्म वर्ष " + d.slice(0, 4) + " का कुआ, पारंपरिक " + (sex === "f" ? "महिला" : "पुरुष") + " सूत्र से (वर्षारंभ समायोजन बिना)?", k.value, "y = " + k.yearRoot + " ; " + (sex === "f" ? "y+4" : "11−y") + " → " + k.raw + (k.raw !== k.value ? " → " + k.value : "")); }]
  };
  NS.methodGen = GEN;

  /* ---------- concept questions: [question, [correct, wrong, wrong, wrong]] (shuffled when shown) ---------- */
  function C(q, o, why) { return { q: q, o: o, why: why }; }
  var P2 = function (a) { return [a, a]; };
  var CONCEPT = {
    vedic: [
      C(["Which part of the date gives the Mulank?", "मूलांक तिथि के किस भाग से मिलता है?"], [["The day only", "केवल दिन"], ["The month only", "केवल महीना"], ["The year only", "केवल वर्ष"], ["The whole date", "पूरी तिथि"]], ["Mulank reduces the birth day.", "मूलांक जन्म के दिन को घटाकर मिलता है।"]),
      C(["Which planet is traditionally linked with 6?", "पारंपरिक रूप से 6 से कौन-सा ग्रह जुड़ा है?"], [["Venus", "शुक्र"], ["Mercury", "बुध"], ["Saturn", "शनि"], ["Mars", "मंगल"]], ["6 is linked with Venus.", "6 शुक्र से जुड़ा है।"]),
      C(["Two partners share the same Mulank. What follows?", "दो साथियों का मूलांक समान है। इससे क्या पता चलता है?"], [["A shared theme to discuss, with no outcome decided", "चर्चा योग्य साझा विषय; परिणाम तय नहीं"], ["Guaranteed harmony", "निश्चित सामंजस्य"], ["Certain conflict", "निश्चित टकराव"], ["Their needs are identical", "उनकी ज़रूरतें एक जैसी हैं"]], ["Similarity is not compatibility.", "समानता अनुकूलता नहीं है।"]),
      C(["What should you write beside every number in a report?", "रिपोर्ट में हर अंक के साथ क्या लिखें?"], [["The system and component that produced it", "वह पद्धति और घटक जिससे वह मिला"], ["A compatibility score", "अनुकूलता अंक"], ["A prediction", "भविष्यवाणी"], ["Nothing", "कुछ नहीं"]], ["Systems must not be mixed silently.", "पद्धतियाँ चुपचाप नहीं मिलाई जातीं।"])],
    pythagorean: [
      C(["Soul Urge is calculated from:", "सोल अर्ज किससे निकलता है?"], [["The vowels of the name", "नाम के स्वरों से"], ["The consonants", "व्यंजनों से"], ["The birth day", "जन्म के दिन से"], ["All letters", "सभी अक्षरों से"]], ["Vowels A E I O U in this app.", "इस ऐप में स्वर A E I O U।"]),
      C(["How does this course calculate Life Path?", "यह कोर्स लाइफ पाथ कैसे निकालता है?"], [["Reduce day, month and year separately, then add and reduce", "दिन, महीना, वर्ष अलग घटाकर जोड़ें और घटाएँ"], ["Reduce only the day", "केवल दिन घटाएँ"], ["Add the name letters", "नाम के अक्षर जोड़ें"], ["Use only the year", "केवल वर्ष लें"]], ["Other schools may differ.", "अन्य मत अलग हो सकते हैं।"]),
      C(["What is done with 11 or 22?", "11 या 22 के साथ क्या करते हैं?"], [["Note it, and also reduce it for archetype mapping", "दर्ज करें और आर्कटाइप के लिए घटाएँ भी"], ["Treat it as a bad number", "अशुभ मानें"], ["Ignore the person’s profile", "प्रोफ़ाइल छोड़ दें"], ["Add 1 to it", "उसमें 1 जोड़ें"]], ["Master numbers are noted without fear or status claims.", "मास्टर अंक बिना भय या श्रेष्ठता दावे के दर्ज होते हैं।"]),
      C(["In the 1-4-7 grid, which numbers form the row commonly called emotional?", "1-4-7 ग्रिड में आम तौर पर भावनात्मक कही जाने वाली पंक्ति कौन-सी है?"], [P2("2-5-8"), P2("1-4-7"), P2("3-6-9"), P2("4-9-2")], ["Plane names vary between schools.", "तलों के नाम मत अनुसार बदलते हैं।"])],
    chaldean: [
      C(["Which statement is true of the Chaldean chart?", "कैल्डियन तालिका के बारे में कौन-सा कथन सही है?"], [["No letter has the value 9", "किसी अक्षर का मान 9 नहीं"], ["Letters run A=1 to I=9", "A=1 से I=9 क्रम है"], ["Only vowels are counted", "केवल स्वर गिनते हैं"], ["Z equals 8", "Z = 8"]], ["Values run from 1 to 8.", "मान 1 से 8 तक हैं।"]),
      C(["What is a compound number?", "संयुक्त अंक क्या है?"], [["The total before final reduction", "अंतिम घटाव से पहले का योग"], ["The birth day", "जन्म का दिन"], ["Two partners’ numbers multiplied", "दो साथियों के अंकों का गुणनफल"], ["The Kua number", "कुआ अंक"]], ["Compound first, root second.", "पहले संयुक्त, फिर मूल।"]),
      C(["A client asks to change a name to fix constant fighting. Best response?", "ग्राहक लगातार झगड़े ठीक करने को नाम बदलना चाहता है। सबसे अच्छा उत्तर?"], [["Explain that spelling does not repair behaviour; map the conflict and the needs", "बताएँ कि वर्तनी व्यवहार नहीं सुधारती; टकराव और ज़रूरतें समझें"], ["Promise the fighting will stop", "झगड़े रुकने का वादा करें"], ["Warn of disaster without a change", "बिना बदलाव अनर्थ की चेतावनी दें"], ["Give three lucky spellings", "तीन शुभ वर्तनी दें"]], ["No guarantees and no fear.", "न गारंटी, न भय।"]),
      C(["Which spelling should you analyse first?", "पहले किस वर्तनी का विश्लेषण करें?"], [["The one in everyday use, recorded in the report", "रोज़ प्रयोग वाली, जिसे रिपोर्ट में दर्ज करें"], ["Whichever gives the nicest number", "जो सबसे अच्छा अंक दे"], ["A random spelling", "कोई भी"], ["Initials only, without saying so", "बिना बताए केवल आद्याक्षर"]], ["State your input.", "अपना आधार स्पष्ट लिखें।"])],
    loshu: [
      C(["What is the top row of the Lo Shu grid?", "लो शू ग्रिड की ऊपरी पंक्ति क्या है?"], [P2("4-9-2"), P2("1-4-7"), P2("1-2-3"), P2("8-1-6")], ["4-9-2 on top.", "ऊपर 4-9-2।"]),
      C(["How is zero in a birth date treated?", "जन्म तिथि के शून्य का क्या करते हैं?"], [["It is not placed", "उसे नहीं रखते"], ["It goes in the centre", "बीच में रखते हैं"], ["It counts as 1", "1 मानते हैं"], ["It counts as 9", "9 मानते हैं"]], ["The grid has only 1–9.", "ग्रिड में केवल 1–9 हैं।"]),
      C(["A partner’s grid lacks 2. What may you responsibly say?", "साथी के ग्रिड में 2 नहीं है। ज़िम्मेदारी से क्या कह सकते हैं?"], [["It is a theme to explore through real behaviour, not a defect", "वास्तविक व्यवहार से जाँचने योग्य विषय है, दोष नहीं"], ["They cannot care for anyone", "वे किसी की परवाह नहीं कर सकते"], ["The marriage will suffer", "विवाह को कष्ट होगा"], ["They need a remedy at once", "तुरंत उपाय चाहिए"]], ["Missing is not defective.", "अनुपस्थित का अर्थ दोष नहीं।"]),
      C(["Before comparing two grids you must make sure that:", "दो ग्रिड की तुलना से पहले क्या सुनिश्चित करें?"], [["Both use the same filling rule", "दोनों में भरने का नियम समान हो"], ["Both are of the same person", "दोनों एक ही व्यक्ति के हों"], ["One uses Lo Shu and one 1-4-7", "एक लो शू, एक 1-4-7 हो"], ["Both include the name", "दोनों में नाम हो"]], ["Different rules make the comparison meaningless.", "अलग नियम से तुलना अर्थहीन होती है।"])]
  };

  function shuffle(a) { for (var j = a.length - 1; j > 0; j--) { var r = ri(j + 1), x = a[j]; a[j] = a[r]; a[r] = x; } return a; }
  function tabs(id, on) {
    return '<div class="chips">' + IDS.map(function (x) { return '<a class="chip wide ' + (x === id ? "on" : "") + '" href="#/mlab/' + x + "/" + on + '">' + t(M[x].name) + "</a>"; }).join("") + '</div><div class="tabs">' + [["calc", ["Engine and calculator", "इंजन और कैलकुलेटर"]], ["couple", ["Couple assessment", "युगल आकलन"]], ["drill", ["Calculation lab", "गणना लैब"]], ["test", ["Scored assessment", "अंकित परीक्षण"]]].map(function (x) { return '<a class="btn ' + (x[0] === on ? "gold" : "") + '" href="#/mlab/' + id + "/" + x[0] + '">' + t(x[1]) + "</a>"; }).join("") + "</div>";
  }
  function field(label, key, type, val) { return "<label>" + label + '<input data-in="' + key + '" type="' + type + '" value="' + esc(val || "") + '"' + (type === "text" ? ' maxlength="80" autocomplete="off"' : "") + "></label>"; }
  function inputs(id, k, p) {
    var need = M[id].needs, h = "";
    if (need !== "dob" || id === "vedic") h += field(L("Name (English letters)", "नाम (अंग्रेज़ी अक्षर)") + (id === "vedic" ? " · " + L("optional", "वैकल्पिक") : ""), k + ".name", "text", p.name);
    if (need !== "name") h += field(L("Date of birth", "जन्म तिथि"), k + ".dob", "date", p.dob);
    if (id === "chaldean") h += field(L("Another spelling (optional)", "दूसरी वर्तनी (वैकल्पिक)"), k + ".alt", "text", p.alt);
    if (id === "loshu") h += "<label>" + L("Kua formula (optional)", "कुआ सूत्र (वैकल्पिक)") + '<select data-in="' + k + '.kua"><option value="">' + L("Do not add", "न जोड़ें") + '</option><option value="m"' + (p.kua === "m" ? " selected" : "") + ">" + L("Traditional male", "पारंपरिक पुरुष") + '</option><option value="f"' + (p.kua === "f" ? " selected" : "") + ">" + L("Traditional female", "पारंपरिक महिला") + "</option></select></label>";
    return '<div class="form">' + h + "</div>";
  }
  function loshuOpts(p) { var o = store().in; return { mulank: !!o.addMu, bhagyank: !!o.addBh, kua: p.kua || "" }; }
  function resultHtml(id, p) {
    var r = compute(id, p, loshuOpts(p));
    if (!r) return '<p class="muted">' + L("Fill in the details to see the working.", "गणना देखने के लिए विवरण भरें।") + "</p>";
    var links = "";
    if (id !== "loshu") links = '<p class="small">' + r.keys.map(function (k) { return t(k[0]) + ": " + archLink(k[1]); }).join(" · ") + "</p>";
    return U.table(RES, r.rows.map(function (x) { return [x[0], String(x[1]), x[2]]; })) + links + r.extra;
  }
  function person(k) { var I = store().in; return I[k] || (I[k] = {}); }
  function bind(redraw) {
    each("[data-in]", function (el) { el.onchange = function () { var a = el.dataset.in.split("."); person(a[0])[a[1]] = el.value; U.save(); redraw(); }; });
    each("[data-add]", function (el) { el.onchange = function () { store().in[el.dataset.add] = el.checked; U.save(); redraw(); }; });
  }
  function loshuChecks() { var I = store().in; return '<div class="inline">' + [["addMu", ["Also add Mulank", "मूलांक भी जोड़ें"]], ["addBh", ["Also add Bhagyank", "भाग्यांक भी जोड़ें"]]].map(function (x) { return '<label class="chk"><input type="checkbox" data-add="' + x[0] + '"' + (I[x[0]] ? " checked" : "") + "> " + t(x[1]) + "</label>"; }).join("") + "</div>"; }

  function coupleHtml(id) {
    var a = person("a"), b = person("b"), x = compute(id, a, loshuOpts(a)), y = compute(id, b, loshuOpts(b));
    if (!x || !y) return '<p class="muted">' + L("Fill in both people to compare.", "तुलना के लिए दोनों का विवरण भरें।") + "</p>";
    var h = '<div class="grid2"><div><h3>A</h3>' + resultHtml(id, a) + "</div><div><h3>B</h3>" + resultHtml(id, b) + "</div></div><h3>" + L("Comparison", "तुलना") + "</h3>";
    if (id === "loshu") {
      var both = [], oa = [], ob = [], none = [];
      for (var n = 1; n <= 9; n++) (x.keys[n] && y.keys[n] ? both : x.keys[n] ? oa : y.keys[n] ? ob : none).push(n);
      h += U.table([["Pattern", "प्रतिरूप"], ["Numbers", "अंक"], ["Conversation question", "बातचीत का प्रश्न"]], [[["In both", "दोनों में"], both.join(", ") || "–", ["Where do we find this easy together, and where do we both overdo it?", "यह हमें साथ कहाँ सहज लगता है, और कहाँ हम दोनों अति करते हैं?"]], [["Only A", "केवल A"], oa.join(", ") || "–", ["How does A show this, and does B value it?", "A इसे कैसे दिखाते हैं, और क्या B इसकी कद्र करते हैं?"]], [["Only B", "केवल B"], ob.join(", ") || "–", ["How does B show this, and does A value it?", "B इसे कैसे दिखाते हैं, और क्या A इसकी कद्र करते हैं?"]], [["Neither", "किसी में नहीं"], none.join(", ") || "–", ["Is this area actually difficult for us? Check real behaviour.", "क्या यह क्षेत्र हमारे लिए सचमुच कठिन है? वास्तविक व्यवहार देखें।"]]]);
    } else {
      var rows = [];
      x.keys.forEach(function (k) {
        var other = y.keys.filter(function (z) { return z[0][0] === k[0][0]; })[0]; if (!other) return;
        var pr = NS.pairs && NS.pairs[Math.min(k[1], other[1]) + "-" + Math.max(k[1], other[1])];
        rows.push("<tr><td>" + t(k[0]) + "</td><td>" + archLink(k[1]) + "</td><td>" + archLink(other[1]) + '</td><td><a href="#/pair/' + k[1] + "/" + other[1] + '">' + k[1] + other[1] + (pr ? " · " + t(pr.title) : "") + "</a></td></tr>");
      });
      h += '<div class="tw"><table><tr><th>' + L("Component", "घटक") + "</th><th>A</th><th>B</th><th>" + L("Pairing chapter", "जोड़ी अध्याय") + "</th></tr>" + rows.join("") + "</table></div>";
    }
    return h + '<p class="note">' + L("This assessment gives conversation themes. It gives no score and no verdict. Confirm every theme with what both people actually report.", "यह आकलन बातचीत के विषय देता है, कोई अंक या निर्णय नहीं। हर विषय को दोनों के वास्तविक अनुभव से जाँचें।") + "</p>";
  }
  var OBS = [["Themes that match what both people report", "दोनों के अनुभव से मेल खाते विषय"], ["Themes that do not match (say so honestly)", "मेल न खाते विषय (ईमानदारी से लिखें)"], ["Unmet needs each person named", "दोनों की बताई अधूरी ज़रूरतें"], ["Accept / Ignore / Adjust / Work Upon items", "स्वीकारें / अनदेखा / समायोजन / काम के मुद्दे"], ["One agreed next step", "एक तय अगला कदम"]];

  var run = {};
  V.mlab = function (id, tab) {
    if (!id) {
      var res = store().test;
      return { html: head(L("METHOD LABS", "पद्धति लैब"), L("Four systems, four sets of tools", "चार पद्धतियाँ, चारों के टूल"), L("Each system has its own engine and calculator, couple assessment, calculation lab and scored assessment. Their results are never mixed into one value.", "हर पद्धति का अपना इंजन-कैलकुलेटर, युगल आकलन, गणना लैब और अंकित परीक्षण है। परिणाम कभी एक मान में नहीं मिलाए जाते।")) + '<div class="grid">' + IDS.map(function (k) { var m = M[k]; return '<a class="tile" href="#/mlab/' + k + '/calc"><b>' + m.icon + " " + t(m.name) + "</b><small>" + t(m.about) + "</small><small>" + (res[k] ? L("Best assessment: ", "सर्वोत्तम परीक्षण: ") + res[k].best + "%" : L("Assessment not taken yet", "परीक्षण अभी नहीं दिया")) + "</small></a>"; }).join("") + '</div><p><a class="btn gold" href="#/xcompare">' + L("Four-method couple comparison sheet", "चार-पद्धति युगल तुलना पत्र") + '</a> <a class="btn" href="#/methods">' + L("Method guides", "पद्धति मार्गदर्शिकाएँ") + "</a></p>" };
    }
    var m = M[id]; if (!m) return null;
    tab = ["calc", "couple", "drill", "test"].indexOf(tab) >= 0 ? tab : "calc";
    var h = head(L("METHOD LAB", "पद्धति लैब"), t(m.name), t(m.about)) + tabs(id, tab);
    if (tab === "calc") {
      var p = person("a");
      h += "<h3>" + L("Engine rules used here", "यहाँ प्रयुक्त इंजन नियम") + "</h3>" + U.table([["Item", "विषय"], ["Rule", "नियम"]], m.rules.map(function (r) { return [[r[0], r[1]], [r[2], r[3]]]; })) + '<p><a href="#/methods/' + id + '">' + L("Read the full method guide", "पूरी पद्धति मार्गदर्शिका पढ़ें") + "</a></p><h3>" + L("Calculator", "कैलकुलेटर") + "</h3>" + inputs(id, "a", p) + (id === "loshu" ? loshuChecks() : "") + privacy() + '<div id="mlOut" aria-live="polite"></div><button class="btn gold" data-print>' + L("Print / save as PDF", "प्रिंट / PDF सहेजें") + "</button>";
      return { html: h, after: function () { function d() { $("mlOut").innerHTML = resultHtml(id, person("a")); } bind(d); d(); } };
    }
    if (tab === "couple") {
      var o = store().obs[id] || (store().obs[id] = []);
      h += '<div class="grid2">' + ["a", "b"].map(function (k) { return "<fieldset><legend>" + k.toUpperCase() + "</legend>" + inputs(id, k, person(k)) + "</fieldset>"; }).join("") + "</div>" + (id === "loshu" ? loshuChecks() : "") + privacy() + '<div id="mlOut" aria-live="polite"></div><h3>' + L("Your assessment notes", "आपके आकलन नोट") + "</h3>" + OBS.map(function (x, i) { return "<label class='blk'>" + t(x) + '<textarea rows="3" data-obs="' + i + '">' + esc(o[i] || "") + "</textarea></label>"; }).join("") + '<button class="btn gold" data-print>' + L("Print / save as PDF", "प्रिंट / PDF सहेजें") + "</button>";
      return { html: h, after: function () { function d() { $("mlOut").innerHTML = coupleHtml(id); } bind(d); each("[data-obs]", function (el) { el.oninput = function () { o[+el.dataset.obs] = el.value; U.save(); }; }); d(); } };
    }
    if (tab === "drill") {
      var st = store().drill[id] || (store().drill[id] = { right: 0, tried: 0 });
      h += "<p>" + L("A new calculation each time. Work it on paper first. The working appears after you answer.", "हर बार नई गणना। पहले कागज़ पर हल करें। उत्तर देने के बाद गणना दिखेगी।") + '</p><p id="drStat" class="formula"></p><div class="casebox"><p id="drQ"></p><div class="form"><label>' + L("Your answer", "आपका उत्तर") + '<input id="drA" type="number" inputmode="numeric"></label><button class="btn gold" id="drGo">' + L("Check", "जाँचें") + '</button><button class="btn" id="drNext">' + L("Next question", "अगला प्रश्न") + '</button></div><div id="drOut" aria-live="polite"></div></div>';
      return { html: h, after: function () {
        var cur, done;
        function stat() { $("drStat").textContent = lr("Solved correctly: ", "सही हल: ") + st.right + " / " + st.tried; }
        function next() { cur = GEN[id][ri(GEN[id].length)](); done = false; $("drQ").textContent = U.raw(cur.q); $("drA").value = ""; $("drOut").innerHTML = ""; }
        $("drGo").onclick = function () {
          var v = $("drA").value.trim(); if (v === "") return;
          var ok = Number(v) === Number(cur.a);
          if (!done) { done = true; st.tried++; if (ok) st.right++; U.save(); stat(); }
          $("drOut").innerHTML = '<div class="why">' + (ok ? "✓ " + L("Correct. ", "सही। ") : "✗ " + L("Answer: ", "उत्तर: ") + esc(cur.a) + ". ") + esc(cur.why) + "</div>";
        };
        $("drA").onkeydown = function (e) { if (e.key === "Enter") $("drGo").onclick(); };
        $("drNext").onclick = function () { next(); $("drA").focus(); };
        stat(); next();
      } };
    }
    var rec = store().test[id];
    if (!run[id]) {
      var calc = [], seen = {}, guard = 0;
      while (calc.length < 11 && guard++ < 300) { var g = GEN[id][calc.length % GEN[id].length](); if (!seen[g.q[0]]) { seen[g.q[0]] = 1; calc.push(g); } }
      run[id] = calc.concat(shuffle(CONCEPT[id].slice()).map(function (c) { var order = shuffle([0, 1, 2, 3]); return { q: c.q, opts: order.map(function (i) { return c.o[i]; }), right: order.indexOf(0), why: c.why }; }));
    }
    var set = run[id];
    h += "<p>" + L("15 questions: 11 fresh calculations and 4 judgement questions. Pass mark 60%.", "15 प्रश्न: 11 नई गणनाएँ और 4 निर्णय प्रश्न। उत्तीर्ण 60%।") + (rec ? " " + L("Best: ", "सर्वोत्तम: ") + rec.best + "% · " + L("attempts: ", "प्रयास: ") + rec.tries : "") + "</p>" +
      set.map(function (x, i) { return "<fieldset id='mt" + i + "'><legend>" + (i + 1) + ". " + t(x.q) + "</legend>" + (x.opts ? x.opts.map(function (o2, j) { return '<label><input type="radio" name="mt' + i + '" value="' + j + '"> ' + t(o2) + "</label>"; }).join("") : '<input type="number" inputmode="numeric" data-ans="' + i + '" aria-label="answer ' + (i + 1) + '">') + '<div class="why" hidden></div></fieldset>'; }).join("") +
      '<button class="btn gold" id="mtGo">' + L("Submit assessment", "परीक्षण जमा करें") + '</button> <button class="btn" id="mtNew">' + L("New set", "नया प्रश्न-पत्र") + '</button><div id="mtScore" aria-live="polite"></div>';
    return { html: h, after: function () {
      $("mtNew").onclick = function () { delete run[id]; NS.go(); };
      $("mtGo").onclick = function () {
        function given(x, i) { if (x.opts) { var c = document.querySelector('input[name="mt' + i + '"]:checked'); return c ? c.value : ""; } return document.querySelector('[data-ans="' + i + '"]').value.trim(); }
        var blank = set.filter(function (x, i) { return given(x, i) === ""; }).length;
        if (blank && !confirm(lr(blank + " questions are unanswered. Submit anyway?", blank + " प्रश्न बाकी हैं। फिर भी जमा करें?"))) return;
        var right = 0;
        set.forEach(function (x, i) {
          var g2 = given(x, i), ok = g2 !== "" && Number(g2) === Number(x.opts ? x.right : x.a), f = $("mt" + i), w = f.querySelector(".why");
          if (ok) right++;
          f.className = ok ? "ok" : "no"; w.hidden = false;
          w.innerHTML = (ok ? "✓ " : "✗ " + L("Correct answer: ", "सही उत्तर: ") + (x.opts ? t(x.opts[x.right]) : esc(x.a)) + ". ") + (x.opts ? t(x.why) : esc(x.why));
        });
        var pct = Math.round(100 * right / set.length), r2 = store().test[id] || { best: 0, tries: 0 };
        r2.best = Math.max(r2.best, pct); r2.tries++; r2.last = pct; store().test[id] = r2; U.save();
        $("mtGo").disabled = true;
        $("mtScore").innerHTML = '<div class="keybox"><b>' + right + " / " + set.length + " (" + pct + "%)</b> " + (pct >= 60 ? L("Passed. Review any red items.", "उत्तीर्ण। लाल प्रश्न दोहराएँ।") : L("Not yet 60%. Practise in the calculation lab and try a new set.", "अभी 60% नहीं। गणना लैब में अभ्यास कर नया प्रश्न-पत्र लें।")) + "</div>";
        $("mtScore").scrollIntoView({ block: "center" });
      };
    } };
  };

  V.xcompare = function () {
    var h = head(L("METHOD LABS", "पद्धति लैब"), L("Four-method couple comparison sheet", "चार-पद्धति युगल तुलना पत्र"), L("Two people, four systems side by side. Look for themes that repeat, record themes that disagree, and test both against real behaviour.", "दो व्यक्ति, चार पद्धतियाँ साथ-साथ। दोहराते विषय देखें, असहमत विषय दर्ज करें और दोनों को वास्तविक व्यवहार से जाँचें।")) + '<div class="grid2">' + ["a", "b"].map(function (k) { var p = person(k); return "<fieldset><legend>" + k.toUpperCase() + '</legend><div class="form">' + field(L("Name (English letters)", "नाम (अंग्रेज़ी अक्षर)"), k + ".name", "text", p.name) + field(L("Date of birth", "जन्म तिथि"), k + ".dob", "date", p.dob) + "</div></fieldset>"; }).join("") + "</div>" + privacy() + '<div id="mlOut" aria-live="polite"></div><button class="btn gold" data-print>' + L("Print / save as PDF", "प्रिंट / PDF सहेजें") + "</button>";
    return { html: h, after: function () {
      function line(id, p) {
        var r = compute(id, p, { kua: p.kua || "" }); if (!r) return "–";
        if (id === "loshu") { var miss = [], rep = []; for (var n = 1; n <= 9; n++) { if (!r.keys[n]) miss.push(n); else if (r.keys[n] > 1) rep.push(n + "×" + r.keys[n]); } return lr("missing ", "अनुपस्थित ") + (miss.join(",") || "–") + " ; " + lr("repeated ", "दोहराए ") + (rep.join(",") || "–"); }
        return r.keys.map(function (k) { return U.raw(k[0]) + " " + k[1]; }).join(" ; ");
      }
      function d() {
        var a = person("a"), b = person("b");
        $("mlOut").innerHTML = U.table([["System", "पद्धति"], ["A", "A"], ["B", "B"]], IDS.map(function (id) { return [M[id].name, line(id, a), line(id, b)]; })) + '<p class="note">' + L("Agreement between systems does not prove anything, and disagreement is not an error. Do not pick only the system that supports your first impression.", "पद्धतियों की सहमति कुछ सिद्ध नहीं करती और असहमति गलती नहीं है। केवल पहली धारणा से मेल खाती पद्धति न चुनें।") + "</p>";
      }
      bind(d); d();
    } };
  };
})();

;
/* ===== app.js ===== */
/* Pages, side menu, search and router. */
(function () {
  var U = NS.ui, S = U.S, V = NS.views, t = U.t, L = U.L, lr = U.lr, esc = U.esc, head = V.head;
  function $(id) { return document.getElementById(id); }
  var DAYS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].filter(function (d) { return NS.days && NS.days[d]; });
  function day(n) { return NS.days[n]; }
  function mkey(n, id) { return n + ":" + id; }
  function dayDone(n) { return day(n).modules.filter(function (m) { return S.done[mkey(n, m.id)]; }).length; }
  function daysComplete() { return DAYS.filter(function (n) { return dayDone(n) === day(n).modules.length; }).length; }
  function allModules() { var a = []; DAYS.forEach(function (n) { day(n).modules.forEach(function (m) { a.push({ n: n, m: m }); }); }); return a; }
  function pct() { var a = allModules(); return a.length ? Math.round(100 * a.filter(function (x) { return S.done[mkey(x.n, x.m.id)]; }).length / a.length) : 0; }
  function dayTitle(n) { return lr("Day ", "दिन ") + n; }

  NS.download = function (name, type, text) {
    var a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([text], { type: type })); a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(a.href); }, 4000);
  };

  var REF = [["arch", "🔢", ["Nine archetype library", "नौ आर्कटाइप पुस्तकालय"]], ["traits", "📚", ["Trait dictionary", "गुण कोश"]], ["matrix", "▦", ["81 interaction matrix", "81 अंतःक्रिया मैट्रिक्स"]], ["methods", "🧮", ["Vedic, Lo Shu, Pythagorean, Chaldean", "वैदिक, लो शू, पाइथागोरियन, कैल्डियन"]], ["wiki", "🕸", ["Concept wiki", "अवधारणा विकि"]], ["causes", "⚠", ["100 causes of stress", "तनाव के 100 कारण"]], ["cases", "👪", ["Case study library", "केस स्टडी पुस्तकालय"]], ["compound", "∑", ["Compound number library", "संयुक्त अंक पुस्तकालय"]], ["frameworks", "◈", ["NUMEROSUTRAS frameworks", "NUMEROSUTRAS ढाँचे"]], ["resources", "🔖", ["Learning material and reading", "अध्ययन सामग्री और पठन"]]];
  var LABS = [["decide", "◈", ["Accept · Ignore · Adjust · Work", "स्वीकारें · अनदेखा · समायोजन · काम"]], ["practice", "✓", ["Classify 48 situations", "48 स्थितियों का अभ्यास"]], ["calc", "🧮", ["Four-system calculator", "चार-पद्धति कैलकुलेटर"]], ["loshu", "▦", ["3 × 3 grid lab", "3 × 3 ग्रिड लैब"]], ["compare", "👥", ["Couple stress matrix", "युगल तनाव मैट्रिक्स"]], ["needs", "♥", ["Emotional needs comparison", "भावनात्मक आवश्यकता तुलना"]], ["emap", "⚡", ["Emotional stress map", "भावनात्मक तनाव मानचित्र"]], ["conflict", "💬", ["Conflict map", "टकराव मानचित्र"]], ["plan30", "📅", ["30-day planner", "30-दिन योजनाकार"]], ["report", "📄", ["Report generator", "रिपोर्ट निर्माता"]], ["assess", "⚖", ["Positive-negative matrix", "सकारात्मक-नकारात्मक मैट्रिक्स"]], ["planner", "🌱", ["Personal growth planner", "निजी विकास योजनाकार"]]];
  var MLABS = [["mlab", "◎", ["All four method labs", "चारों पद्धति लैब"]], ["mlab/vedic", "☉", ["Vedic lab", "वैदिक लैब"]], ["mlab/pythagorean", "△", ["Pythagorean lab", "पाइथागोरियन लैब"]], ["mlab/chaldean", "𝕮", ["Chaldean lab", "कैल्डियन लैब"]], ["mlab/loshu", "▦", ["Lo Shu lab", "लो शू लैब"]], ["xcompare", "⇆", ["Four-method comparison", "चार-पद्धति तुलना"]]];
  var MINE = [["progress", "📊", ["Progress and assessment", "प्रगति और मूल्यांकन"]], ["notes", "📝", ["Notes and bookmarks", "नोट्स और बुकमार्क"]], ["settings", "⚙", ["Settings and backup", "सेटिंग और बैकअप"]]];

  function sideHtml() {
    var cur = location.hash;
    function nav(h, label, small) { return '<a class="nav' + (cur === h ? " on" : "") + '" href="' + h + '">' + label + (small ? "<small>" + small + "</small>" : "") + "</a>"; }
    var h = nav("#/home", "🏠 " + L("Home", "होम")) + nav("#/intro", L("Course introduction", "कोर्स परिचय")) + nav("#/instructor", L("Your instructor", "आपकी प्रशिक्षक"));
    h += "<h2>" + L("10-day course", "10 दिन का कोर्स") + "</h2>" + DAYS.map(function (n) { var d = day(n), done = dayDone(n), total = d.modules.length; return nav("#/day/" + n, (done === total ? '<span class="tick">✓</span> ' : "") + n + ". " + t(d.title), done + "/" + total + " " + L("modules", "मॉड्यूल")); }).join("");
    [[["Method labs", "पद्धति लैब"], MLABS], [["Practice labs", "अभ्यास लैब"], LABS], [["Reference", "संदर्भ"], REF], [["My learning", "मेरी पढ़ाई"], MINE]].forEach(function (g) { h += "<h2>" + t(g[0]) + "</h2>" + g[1].map(function (r) { return nav("#/" + r[0], r[1] + " " + t(r[2])); }).join(""); });
    return h;
  }

  function tiles(rows) { return '<div class="grid">' + rows.map(function (r) { return '<a class="tile" href="#/' + r[0] + '"><b>' + r[1] + " " + t(r[2]) + "</b></a>"; }).join("") + "</div>"; }
  function instructorCard(full) {
    var i = NS.instructor;
    var body = full ? i.bio.map(function (p) { return "<p>" + t(p) + "</p>"; }).join("") : "<p>" + t(i.short) + '</p><p><a href="#/instructor">' + L("Full profile", "पूरा परिचय") + " →</a></p>";
    return '<div class="person"><img src="instructor.jpg" alt="' + t(i.name) + '" width="120" height="149"><div><h3>' + L("About ", "परिचय: ") + t(i.name) + '</h3><p class="prole">' + t(i.title) + " · " + t(i.role) + "</p>" + body + "</div></div>";
  }
  V.home = function () {
    var c = NS.course, last = S.last || "#/day/1";
    var h = '<div class="hero"><p class="kick">' + c.brand + " · " + t(c.level) + "</p><h1>" + t(c.title) + '</h1><p class="sub">' + t(c.title2) + "</p><p>" + t(c.tagline) + "</p>" +
      '<div class="bar" role="progressbar" aria-valuenow="' + pct() + '" aria-valuemin="0" aria-valuemax="100"><i style="width:' + pct() + '%"></i></div><p class="small">' + daysComplete() + " / " + DAYS.length + " " + L("days complete", "दिन पूर्ण") + " · " + pct() + "% " + L("of modules done", "मॉड्यूल पूरे") + "</p>" +
      '<a class="btn gold" href="' + esc(last) + '">' + (S.last ? L("Continue where you left off", "जहाँ छोड़ा था वहीं से") : L("Start Day 1", "दिन 1 शुरू करें")) + '</a> <a class="btn ghost" href="#/intro">' + L("Course introduction", "कोर्स परिचय") + '</a> <a class="btn ghost" href="#/calc">' + L("Open the calculator", "कैलकुलेटर खोलें") + "</a></div>";
    h += instructorCard();
    h += '<h3 class="sec">' + L("The ten days", "दस दिन") + '</h3><div class="grid">' + DAYS.map(function (n) { var d = day(n); return '<a class="tile" href="#/day/' + n + '"><b>' + n + ". " + t(d.title) + "</b><small>" + d.modules.reduce(function (a, m) { return a + m.mins; }, 0) + " " + L("min", "मिनट") + " · " + dayDone(n) + "/" + d.modules.length + " " + L("modules", "मॉड्यूल") + "</small></a>"; }).join("") + "</div>";
    h += '<h3 class="sec">' + L("Method labs: Vedic, Pythagorean, Chaldean, Lo Shu", "पद्धति लैब: वैदिक, पाइथागोरियन, कैल्डियन, लो शू") + "</h3>" + tiles(MLABS) + '<h3 class="sec">' + L("Practice", "अभ्यास") + "</h3>" + tiles(LABS);
    h += '<h3 class="sec">' + L("Reference", "संदर्भ") + "</h3>" + tiles(REF);
    h += '<h3 class="sec">' + L("The four-action decision system", "चार-क्रिया निर्णय प्रणाली") + '</h3><div class="grid">' + NS.actions.map(function (a, i) { return '<a class="tile" href="#/decide"><b>0' + (i + 1) + " · " + t(a.name) + "</b><small>" + t(a.text) + "</small></a>"; }).join("") + "</div>";
    h += '<h3 class="sec">' + L("Your learning journey", "आपकी सीखने की यात्रा") + '</h3><div class="flow">' + c.journey.map(function (j, i) { return (i ? "<i>→</i>" : "") + "<span>" + t(j) + "</span>"; }).join("") + '</div><p class="note">' + t(NS.boundary) + "</p>";
    return { html: h };
  };
  V.intro = function () {
    return { html: head(NS.course.brand, L("Course introduction", "कोर्स परिचय"), t(NS.course.subtitle)) + '<div class="reading">' + U.blocks(NS.intro) +
      "<h3>" + L("Daily teaching plan (instructor-led)", "दैनिक शिक्षण योजना (प्रशिक्षक के साथ)") + "</h3>" + U.table([["Activity", "गतिविधि"], ["Minutes", "मिनट"]], NS.teaching.map(function (r) { return [r[0], String(r[1])]; }).concat([[["Total", "कुल"], "120"]])) +
      "<h3>" + L("Assessment weights", "मूल्यांकन भार") + "</h3>" + U.table([["Assessment", "मूल्यांकन"], ["Weight", "भार"]], NS.assessment.map(function (a) { return [a.name, a.w + "%"]; })) + "<p>" + L("Certificate: 80% attendance, daily assignments, couple assessment, final capstone and at least 60% overall.", "प्रमाणपत्र: 80% उपस्थिति, दैनिक असाइनमेंट, युगल आकलन, अंतिम कैपस्टोन और कुल कम से कम 60%।") + "</p>" +
      '<div class="note">' + t(NS.boundary) + '</div><p><a class="btn gold" href="#/day/1">' + L("Start Day 1", "दिन 1 शुरू करें") + "</a></p></div>" };
  };
  V.instructor = function () { return { html: head(NS.course.brand, L("Your instructor", "आपकी प्रशिक्षक")) + instructorCard(true) }; };

  /* ---------- day, module, quiz, flashcards, worksheet ---------- */
  function dayTabs(n, on) {
    var q = S.quiz[n];
    return '<div class="tabs"><a class="btn ' + (on === "day" ? "gold" : "") + '" href="#/day/' + n + '">' + L("Overview", "सार") + '</a><a class="btn ' + (on === "rev" ? "gold" : "") + '" href="#/rev/' + n + '">' + L("Revision and FAQ", "पुनरावृत्ति और प्रश्नोत्तर") + '</a><a class="btn ' + (on === "quiz" ? "gold" : "") + '" href="#/quiz/' + n + '">' + L("Quiz", "क्विज़") + (q ? " (" + q.best + "%)" : "") + '</a><a class="btn ' + (on === "flash" ? "gold" : "") + '" href="#/flash/' + n + '">' + L("Flashcards", "फ्लैशकार्ड") + '</a><a class="btn ' + (on === "ws" ? "gold" : "") + '" href="#/ws/' + n + '">' + L("Assignment sheet", "असाइनमेंट पत्र") + "</a></div>";
  }
  V.day = function (n) {
    var d = day(n); if (!d) return null;
    var h = head(dayTitle(n), t(d.title), t(d.theme)) + dayTabs(n, "day") + "<h3>" + L("After this day you can", "इस दिन के बाद आप") + "</h3>" + U.list(d.objectives) + "<h3>" + L("Modules", "मॉड्यूल") + '</h3><div class="grid">' + d.modules.map(function (m) { return '<a class="tile" href="#/m/' + n + "/" + m.id + '"><b>' + (S.done[mkey(n, m.id)] ? '<span class="tick">✓</span> ' : "") + m.id + " " + t(m.title) + "</b><small>" + m.mins + " " + L("min", "मिनट") + (S.marks[mkey(n, m.id)] ? " · ★" : "") + "</small></a>"; }).join("") + "</div>";
    h += '<div class="keybox"><b>' + L("Day outcome: ", "दिन का परिणाम: ") + "</b>" + t(d.outcome) + "<br><b>" + L("Deliverable: ", "प्रस्तुत करें: ") + "</b>" + t(d.deliverable) + "</div><h3>" + L("Reflect before moving on", "आगे बढ़ने से पहले सोचें") + "</h3>" + U.list(d.reflect, "ol");
    h += '<details class="check"><summary>' + L("Teaching notes for the instructor", "प्रशिक्षक के लिए शिक्षण नोट") + "</summary>" + U.list(d.instructor) + "</details>";
    h += '<div class="pager">' + (day(n - 1) ? '<a class="btn" href="#/day/' + (n - 1) + '">← ' + dayTitle(n - 1) + "</a>" : "<span></span>") + '<a class="btn gold" href="#/m/' + n + "/" + d.modules[0].id + '">' + L("Start learning", "पढ़ना शुरू करें") + "</a>" + (day(n + 1) ? '<a class="btn" href="#/day/' + (n + 1) + '">' + dayTitle(n + 1) + " →</a>" : "<span></span>") + "</div>";
    return { html: h };
  };
  V.m = function (n, id) {
    var d = day(n); if (!d) return null;
    var i = d.modules.findIndex(function (m) { return m.id === id; }); if (i < 0) return null;
    var m = d.modules[i], k = mkey(n, id), prev = d.modules[i - 1], next = d.modules[i + 1];
    var h = head(dayTitle(n) + " · " + L("Module ", "मॉड्यूल ") + m.id + " · " + m.mins + " " + L("min", "मिनट"), t(m.title)) +
      '<div class="tools noprint"><button class="btn" id="bm">' + (S.marks[k] ? "★ " + L("Bookmarked", "बुकमार्क किया") : "☆ " + L("Bookmark", "बुकमार्क")) + '</button><button class="btn" id="say">🔊 ' + L("Read aloud", "पढ़कर सुनाएँ") + '</button><button class="btn" data-print>🖨 ' + L("Print", "प्रिंट") + '</button></div><div class="reading" id="lesson">' + U.blocks(m.blocks) + "</div>";
    h += "<label class='blk'><b>" + L("My notes on this module", "इस मॉड्यूल पर मेरे नोट") + '</b><textarea id="mnote" rows="4">' + esc(S.notes[k] || "") + "</textarea></label>";
    h += '<div class="pager noprint">' + (prev ? '<a class="btn" href="#/m/' + n + "/" + prev.id + '">← ' + prev.id + "</a>" : '<a class="btn" href="#/day/' + n + '">← ' + L("Day overview", "दिन का सार") + "</a>") + '<button class="btn gold" id="done">' + (S.done[k] ? "✓ " + L("Completed (undo)", "पूर्ण (वापस लें)") : L("Mark complete and continue", "पूर्ण चिह्नित कर आगे बढ़ें")) + "</button>" + (next ? '<a class="btn" href="#/m/' + n + "/" + next.id + '">' + next.id + " →</a>" : '<a class="btn" href="#/quiz/' + n + '">' + L("Quiz", "क्विज़") + " →</a>") + "</div>";
    return { html: h, after: function () {
      $("mnote").oninput = function () { S.notes[k] = this.value; U.save(); };
      $("bm").onclick = function () { if (S.marks[k]) delete S.marks[k]; else S.marks[k] = 1; U.save(); NS.go(true); };
      $("done").onclick = function () { if (S.done[k]) { delete S.done[k]; U.save(); NS.go(true); } else { S.done[k] = 1; U.save(); location.hash = next ? "#/m/" + n + "/" + next.id : "#/quiz/" + n; } };
      var say = $("say");
      if (!window.speechSynthesis) say.hidden = true;
      else say.onclick = function () {
        if (speechSynthesis.speaking) { speechSynthesis.cancel(); return; }
        var parts = [];
        document.querySelectorAll("#lesson h3, #lesson h4, #lesson p, #lesson li, #lesson td, #lesson dt, #lesson dd").forEach(function (el) { if (el.offsetParent && !el.querySelector("p,li")) parts.push(el.textContent); });
        parts.forEach(function (x) { var u = new SpeechSynthesisUtterance(x); u.lang = S.lang === "hi" ? "hi-IN" : "en-IN"; speechSynthesis.speak(u); });
      };
    } };
  };
  V.rev = function (n) {
    var d = day(n); if (!d) return null;
    var h = head(dayTitle(n), L("Revision and learner help", "पुनरावृत्ति और शिक्षार्थी सहायता"), L("Plain-language summary, common mistakes, questions learners ask, practice scenarios and key terms.", "सरल सारांश, आम गलतियाँ, शिक्षार्थियों के प्रश्न, अभ्यास स्थितियाँ और मुख्य शब्द।")) + dayTabs(n, "rev") + '<div class="reading">';
    h += "<h3>" + L("In simple words", "सरल शब्दों में") + "</h3>" + U.list(d.summary, "ol");
    h += "<h3>" + L("Common mistakes", "आम गलतियाँ") + "</h3>" + U.table([["Mistake", "गलती"], ["Better practice", "बेहतर तरीका"]], d.mistakes || []);
    h += "<h3>" + L("Frequently asked questions", "अक्सर पूछे जाने वाले प्रश्न") + "</h3>" + (d.faq || []).map(function (q) { return '<details class="check"><summary><b>' + t(q[0]) + "</b></summary><p>" + t(q[1]) + "</p></details>"; }).join("");
    h += "<h3>" + L("Practice scenarios", "अभ्यास स्थितियाँ") + "</h3>" + (d.practice || []).map(function (q, i) { return '<div class="casebox"><p><b>' + (i + 1) + ".</b> " + t(q[0]) + '</p><details class="check"><summary>' + L("Write your answer first, then see a model answer", "पहले अपना उत्तर लिखें, फिर आदर्श उत्तर देखें") + "</summary><p>" + t(q[1]) + "</p></details></div>"; }).join("");
    h += "<h3>" + L("Glossary", "शब्दावली") + "</h3>" + U.dl(d.glossary || []);
    return { html: h + '</div><button class="btn gold" data-print>' + L("Print / save as PDF", "प्रिंट / PDF सहेजें") + "</button>" };
  };
  function shuffled(n) { var a = []; for (var i = 0; i < n; i++) a.push(i); for (var j = n - 1; j > 0; j--) { var r = Math.floor(Math.random() * (j + 1)), x = a[j]; a[j] = a[r]; a[r] = x; } return a; }
  var orders = {};
  V.quiz = function (n) {
    var d = day(n); if (!d) return null;
    orders[n] = orders[n] || d.quiz.map(function () { return shuffled(4); });
    var q = S.quiz[n];
    var h = head(dayTitle(n), L("Knowledge check", "ज्ञान जाँच"), d.quiz.length + " " + L("questions. You may retake it; your best score counts.", "प्रश्न। आप दोबारा दे सकते हैं; सर्वोत्तम अंक गिना जाएगा।") + (q ? " " + L("Best so far: ", "अब तक सर्वोत्तम: ") + q.best + "%" : "")) + dayTabs(n, "quiz");
    h += d.quiz.map(function (item, i) { return '<fieldset id="q' + i + '"><legend>' + (i + 1) + ". " + t(item.q) + "</legend>" + orders[n][i].map(function (j) { return '<label><input type="radio" name="q' + i + '" value="' + j + '"> ' + t(item.o[j]) + "</label>"; }).join("") + '<div class="why" hidden></div></fieldset>'; }).join("") + '<button class="btn gold" id="grade">' + L("Check my answers", "उत्तर जाँचें") + '</button> <button class="btn" id="again">' + L("Try again", "फिर प्रयास करें") + '</button><div id="score" aria-live="polite"></div>';
    return { html: h, after: function () {
      $("grade").onclick = function () {
        var right = 0, blank = d.quiz.filter(function (x, i) { return !document.querySelector('input[name="q' + i + '"]:checked'); }).length;
        if (blank && !confirm(lr(blank + " questions are unanswered. Check anyway?", blank + " प्रश्न बाकी हैं। फिर भी जाँचें?"))) return;
        d.quiz.forEach(function (item, i) {
          var c = document.querySelector('input[name="q' + i + '"]:checked'), ok = c && +c.value === item.a, f = $("q" + i), w = f.querySelector(".why");
          if (ok) right++;
          f.className = ok ? "ok" : "no"; w.hidden = false;
          w.innerHTML = (ok ? "✓ " : "✗ " + L("Correct answer: ", "सही उत्तर: ") + t(item.o[item.a]) + "<br>") + t(item.why);
        });
        var p = Math.round(100 * right / d.quiz.length), rec = S.quiz[n] || { best: 0, tries: 0 };
        rec.best = Math.max(rec.best, p); rec.last = p; rec.tries++; S.quiz[n] = rec; U.save(); $("side").innerHTML = sideHtml();
        $("score").innerHTML = '<div class="keybox"><b>' + right + " / " + d.quiz.length + " (" + p + "%)</b> " + (p >= 80 ? L("Strong. Move on when ready.", "बहुत अच्छा। तैयार हों तो आगे बढ़ें।") : L("Review the explanations and the related modules, then try again.", "व्याख्याएँ और संबंधित मॉड्यूल दोहराएँ, फिर प्रयास करें।")) + "</div>";
        $("score").scrollIntoView({ block: "center" });
      };
      $("again").onclick = function () { delete orders[n]; NS.go(); };
    } };
  };
  V.flash = function (n) {
    var d = day(n); if (!d) return null;
    var k = S.flash[n] || (S.flash[n] = {});
    var h = head(dayTitle(n), L("Flashcards", "फ्लैशकार्ड"), L("Recall the answer first, then flip. Cards marked “review again” come first next time.", "पहले उत्तर याद करें, फिर पलटें। “दोबारा दोहराएँ” वाले कार्ड अगली बार पहले आएँगे।")) + dayTabs(n, "flash") + '<div id="fc"></div>';
    return { html: h, after: function () {
      var queue = d.flash.map(function (f, i) { return i; }).sort(function (a, b) { return (k[a] === 1 ? 1 : k[a] === 0 ? -1 : 0) - (k[b] === 1 ? 1 : k[b] === 0 ? -1 : 0); }), pos = 0, open = false;
      function draw() {
        var i = queue[pos], f = d.flash[i], known = Object.keys(k).filter(function (x) { return k[x] === 1; }).length;
        $("fc").innerHTML = '<p class="small muted">' + (pos + 1) + " / " + queue.length + " · " + L("known: ", "याद: ") + known + '</p><button class="flashcard" id="card">' + t(open ? f[1] : f[0]) + "<small>" + (open ? L("answer", "उत्तर") : L("tap to flip", "पलटने के लिए दबाएँ")) + '</small></button><div class="pager"><button class="btn" id="fAgain">↻ ' + L("Review again", "दोबारा दोहराएँ") + '</button><button class="btn gold" id="fKnow">✓ ' + L("I knew it", "मुझे आता था") + "</button></div>";
        $("card").onclick = function () { open = !open; draw(); $("card").focus(); };
        function mark(v) { k[i] = v; U.save(); pos = (pos + 1) % queue.length; open = false; draw(); }
        $("fAgain").onclick = function () { mark(0); }; $("fKnow").onclick = function () { mark(1); };
      }
      draw();
    } };
  };
  V.ws = function (n) {
    var d = day(n); if (!d) return null;
    var w = d.worksheet, v = S.ws[n] || (S.ws[n] = {});
    var h = head(dayTitle(n), t(w.title), t(w.intro)) + dayTabs(n, "ws") + "<label class='blk'>" + L("Learner name", "शिक्षार्थी का नाम") + '<input class="wideinput" id="wsName" value="' + esc(S.name) + '"></label>' + w.sections.map(function (s, i) { return "<h3>" + t(s.title) + "</h3>" + s.fields.map(function (f, j) { var key = i + "." + j; return "<label class='blk'>" + t(f) + '<textarea rows="3" data-ws="' + key + '">' + esc(v[key] || "") + "</textarea></label>"; }).join(""); }).join("") + '<p class="small muted">' + L("Answers save automatically on this device.", "उत्तर इस उपकरण पर स्वतः सहेजे जाते हैं।") + '</p><button class="btn gold" data-print>' + L("Print / save as PDF", "प्रिंट / PDF सहेजें") + "</button>";
    return { html: h, after: function () {
      $("wsName").oninput = function () { S.name = this.value; U.save(); };
      document.querySelectorAll("[data-ws]").forEach(function (el) { el.oninput = function () { v[el.dataset.ws] = el.value; U.save(); }; });
    } };
  };

  /* ---------- archetypes ---------- */
  V.arch = function (n, tab) {
    if (!n) return { html: head(L("REFERENCE", "संदर्भ"), L("The nine primary personality archetypes", "नौ प्रमुख व्यक्तित्व आर्कटाइप"), L("Each archetype is a traditional theme with positive, challenging and balanced expressions.", "हर आर्कटाइप एक पारंपरिक विषय है जिसकी सकारात्मक, चुनौतीपूर्ण और संतुलित अभिव्यक्तियाँ हैं।")) + '<div class="grid">' + [1, 2, 3, 4, 5, 6, 7, 8, 9].filter(function (i) { return NS.num[i]; }).map(function (i) { var a = NS.num[i]; return '<a class="tile num" href="#/arch/' + i + '"><span>' + i + "</span><b>" + t(a.name) + "</b><small>" + t(a.area) + " · " + t(a.planet) + "</small></a>"; }).join("") + "</div>" };
    var a = NS.num[n]; if (!a) return null;
    var tabs = ["overview", "core", "pos", "neg", "relation", "improve", "emo", "comm", "shadow", "pressure", "manage", "life", "srm"]; tab = tabs.indexOf(tab) >= 0 ? tab : "overview";
    var h = head(L("ARCHETYPE ", "आर्कटाइप ") + n + " · " + t(a.planet), t(a.name), t(a.area)) + '<div class="chips">' + [1, 2, 3, 4, 5, 6, 7, 8, 9].map(function (i) { return '<a class="chip ' + (i == n ? "on" : "") + '" href="#/arch/' + i + "/" + tab + '">' + i + "</a>"; }).join("") + '</div><div class="tabs">' + tabs.map(function (x) { return '<a class="btn ' + (x === tab ? "gold" : "") + '" href="#/arch/' + n + "/" + x + '">' + (x === "overview" ? L("Overview", "सार") : x === "srm" ? L("Stress and four actions", "तनाव और चार क्रियाएँ") : t(U.PARTS[x])) + "</a>"; }).join("") + '</div><div class="reading">';
    if (tab === "overview") h += "<p>" + t(a.essence) + '</p><div class="chips">' + a.keywords.map(function (k) { return '<span class="chip wide">' + t(k) + "</span>"; }).join("") + '</div><div class="duo"><div class="pos"><h4>✓ ' + L("Positive", "सकारात्मक") + "</h4>" + U.list(a.pos.map(function (p) { return p[0]; })) + '</div><div class="neg"><h4>! ' + L("Challenging", "चुनौतीपूर्ण") + "</h4>" + U.list(a.neg.map(function (p) { return p[0]; })) + '</div></div><div class="keybox"><b>' + L("Balanced expression: ", "संतुलित अभिव्यक्ति: ") + "</b>" + t(a.balanced) + '</div><div class="casebox"><p class="kick dark">' + L("ILLUSTRATIVE STORY", "उदाहरणात्मक कथा") + "</p><p>" + t(a.story) + "</p></div>";
    else if (tab === "srm") h += srmHtml(n); else h += U.archPart(n, tab);
    return { html: h + "</div>" };
  };

  function srmHtml(n) {
    var s = (NS.srm || {})[n]; if (!s) return "";
    function rows(obj, labels) { return U.dl(Object.keys(labels).filter(function (k) { return obj[k]; }).map(function (k) { return [labels[k], obj[k]]; })); }
    var needs = {}; (NS.NEEDS || []).forEach(function (x) { needs[x[0]] = x[1]; });
    return '<div class="keybox"><b>' + L("Improvement priority: ", "सुधार प्राथमिकता: ") + "</b>" + t(s.priority) + "</div>" + U.list(s.practices) + "<h3>" + L("Stress indicators", "तनाव संकेत") + "</h3>" + U.list(s.stress) +
      "<h3>" + L("Four-action guide", "चार-क्रिया मार्गदर्शिका") + '</h3><div class="grid2">' + NS.actions.map(function (a) { return '<div class="pcard"><h4>' + t(a.name) + "</h4>" + U.list(s.four[a.id]) + "</div>"; }).join("") + "</div><h3>" + L("Nine emotional needs", "नौ भावनात्मक आवश्यकताएँ") + "</h3>" + rows(s.needs, needs) +
      "<h3>" + L("More communication patterns", "अन्य संवाद प्रतिरूप") + "</h3>" + rows(s.comm, { speaking: ["Speaking style", "बोलने की शैली"], silence: ["Handling silence", "मौन से व्यवहार"], disclosure: ["Emotional disclosure", "भाव साझा करना"], apology: ["Response to apologies", "क्षमा-याचना पर प्रतिक्रिया"], compromise: ["Willingness to compromise", "समझौते की तत्परता"] }) +
      "<h3>" + L("Decisions, commitment, money and family", "निर्णय, प्रतिबद्धता, धन और परिवार") + "</h3>" + rows(s, { decision: ["Decision-making", "निर्णय लेना"], commitment: ["Commitment", "प्रतिबद्धता"], finance: ["Money", "धन"], family: ["Family", "परिवार"] }) +
      "<h3>" + L("For the partner: helpful responses", "साथी के लिए: सहायक प्रतिक्रियाएँ") + "</h3>" + U.table([["Situation", "स्थिति"], ["Helpful response", "सहायक प्रतिक्रिया"]], s.partner);
  }
  /* ---------- traits ---------- */
  var CATS = { leadership: ["Leadership", "नेतृत्व"], emotional: ["Emotional", "भावनात्मक"], intellectual: ["Intellectual", "बौद्धिक"], social: ["Social", "सामाजिक"], behavioural: ["Behavioural", "व्यवहारगत"], relationship: ["Relationship", "संबंध"], personal: ["Personal", "निजी"], challenging: ["Challenging", "चुनौतीपूर्ण"], transformational: ["Transformational", "रूपांतरणकारी"], aspirational: ["Aspirational", "आकांक्षात्मक"] };
  var tf = { q: "", c: "", n: "" };
  V.traits = function () {
    var h = head(L("REFERENCE", "संदर्भ"), L("Personality trait dictionary", "व्यक्तित्व गुण कोश") + " (" + (NS.traits || []).length + ")", L("Definition, linked archetypes, positive and challenging expression, observable behaviour, relationship implication and improvement for each trait.", "हर गुण की परिभाषा, संबंधित आर्कटाइप, सकारात्मक और चुनौतीपूर्ण अभिव्यक्ति, दिखने वाला व्यवहार, संबंध प्रभाव और सुधार।")) +
      '<div class="form"><label>' + L("Search", "खोजें") + '<input id="tq" type="search" value="' + esc(tf.q) + '"></label><label>' + L("Category", "श्रेणी") + '<select id="tc"><option value="">' + L("All", "सभी") + "</option>" + Object.keys(CATS).map(function (k) { return '<option value="' + k + '">' + t(CATS[k]) + "</option>"; }).join("") + "</select></label><label>" + L("Archetype", "आर्कटाइप") + '<select id="tn"><option value="">' + L("All", "सभी") + "</option>" + [1, 2, 3, 4, 5, 6, 7, 8, 9].map(function (i) { return '<option value="' + i + '">' + i + "</option>"; }).join("") + '</select></label></div><div id="tout"></div>';
    return { html: h, after: function () {
      $("tc").value = tf.c; $("tn").value = tf.n;
      function draw() {
        tf.q = $("tq").value; tf.c = $("tc").value; tf.n = $("tn").value;
        var q = tf.q.trim().toLowerCase();
        var hits = (NS.traits || []).filter(function (x) { return (!tf.c || x.c === tf.c) && (!tf.n || x.a.indexOf(+tf.n) >= 0) && (!q || (x.n.join(" ") + " " + x.d.join(" ")).toLowerCase().indexOf(q) >= 0); });
        $("tout").innerHTML = '<p class="small muted">' + hits.length + " " + L("traits", "गुण") + "</p>" + hits.map(function (x) { return '<details class="check"><summary><b>' + t(x.n) + '</b> <span class="tag">' + t(CATS[x.c] || x.c) + "</span> <small>" + L("numbers ", "अंक ") + x.a.join(", ") + "</small></summary>" + U.dl([[["Definition", "परिभाषा"], x.d], [["Positive expression", "सकारात्मक अभिव्यक्ति"], x.p], [["Challenging expression", "चुनौतीपूर्ण अभिव्यक्ति"], x.x], [["Observable examples", "दिखने वाले उदाहरण"], x.o], [["Relationship implication", "संबंध पर प्रभाव"], x.r], [["Improvement suggestion", "सुधार सुझाव"], x.i]]) + "</details>"; }).join("");
      }
      $("tq").oninput = draw; $("tc").onchange = draw; $("tn").onchange = draw; draw();
    } };
  };

  /* ---------- matrix and pair chapters ---------- */
  function matrixHtml(sel) {
    var N = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    return '<div class="matrixbox"><h3>NUMEROSUTRAS – 9 × 9 Matrix</h3><p class="small muted">' + L("Individual A (rows) × Individual B (columns)", "व्यक्ति A (पंक्ति) × व्यक्ति B (स्तंभ)") + '</p><div class="tw"><table class="matrix"><thead><tr><th>A/B</th>' + N.map(function (i) { return "<th>" + i + "</th>"; }).join("") + "</tr></thead><tbody>" + N.map(function (a) { return "<tr><th>" + a + "</th>" + N.map(function (b) { return '<td><a class="' + (a === b ? "diag " : "") + (sel === "" + a + b ? "sel " : "") + (S.marks["pair:" + a + b] ? "seen" : "") + '" href="#/pair/' + a + "/" + b + '">' + a + b + "</a></td>"; }).join("") + "</tr>"; }).join("") + "</tbody></table></div><p class=\"small muted\">" + L("81 possible pairings. Highlighted diagonal cells represent same-number pairings. Each cell is an archetype pairing, not a compatibility verdict. A dot marks chapters you have marked as studied.", "81 संभावित जोड़ियाँ। रंगीन विकर्ण खाने समान-अंक जोड़ियाँ हैं। हर खाना एक आर्कटाइप जोड़ी है, अनुकूलता का निर्णय नहीं। बिंदु पढ़े गए अध्याय दिखाता है।") + "</p></div>";
  }
  V.matrix = function () {
    var studied = Object.keys(S.marks).filter(function (k) { return k.indexOf("pair:") === 0; }).length;
    return { html: head(L("FLAGSHIP COMPONENT", "प्रमुख घटक"), L("81 Archetype Interaction Library", "81 आर्कटाइप अंतःक्रिया पुस्तकालय"), L("Open any cell for its pairing chapter. Studied: ", "जोड़ी अध्याय के लिए कोई भी खाना खोलें। पढ़े गए: ") + studied + " / 81") + matrixHtml("") };
  };
  V.pair = function (a, b) {
    a = +a; b = +b; var A = NS.num[a], B = NS.num[b], p = NS.pairs && NS.pairs[Math.min(a, b) + "-" + Math.max(a, b)];
    if (!A || !B || !p) return null;
    var key = "pair:" + a + b;
    function person(n, x, who) { return '<div class="pcard"><p class="kick dark">' + who + "</p><h4>" + n + " · " + t(x.name) + "</h4><p>" + t(x.essence) + "</p><p><b>" + L("Constructive: ", "रचनात्मक: ") + "</b>" + x.pos.slice(0, 5).map(function (r) { return t(r[0]); }).join(", ") + "</p><p><b>" + L("Challenging: ", "चुनौतीपूर्ण: ") + "</b>" + x.neg.slice(0, 5).map(function (r) { return t(r[0]); }).join(", ") + '</p><a href="#/arch/' + n + '">' + L("Full archetype", "पूरा आर्कटाइप") + "</a></div>"; }
    function sec(i, title, body) { return "<h3>" + i + ". " + title + "</h3>" + body; }
    function both(get) { return U.table([["Individual A: " + a, "व्यक्ति A: " + a], ["Individual B: " + b, "व्यक्ति B: " + b]], [[get(A), get(B)]]); }
    var h = head(L("PAIRING CHAPTER ", "जोड़ी अध्याय ") + a + b, a + " × " + b + " · " + t(p.title), L("Study both individuals. This pairing will not always produce the same result.", "दोनों व्यक्तियों को पढ़ें। यह जोड़ी हमेशा एक जैसा परिणाम नहीं देती।"));
    h += '<div class="reading">' + sec(1, L("Introduction: core personality interaction", "परिचय: मूल व्यक्तित्व अंतःक्रिया"), "<p>" + t(p.core) + "</p>") +
      sec(2, L("The two personalities", "दोनों व्यक्तित्व"), '<div class="grid2">' + person(a, A, L("INDIVIDUAL A", "व्यक्ति A")) + person(b, B, L("INDIVIDUAL B", "व्यक्ति B")) + "</div>") +
      sec(3, L("Shared strengths and contrasting tendencies", "साझा शक्तियाँ और विपरीत प्रवृत्तियाँ"), '<div class="duo"><div class="pos"><h4>✓ ' + L("Shared positive characteristics", "साझा सकारात्मक विशेषताएँ") + "</h4>" + U.list(p.shared) + '</div><div class="neg"><h4>↔ ' + L("Differences in temperament", "स्वभाव के अंतर") + "</h4>" + U.list(p.contrast) + "</div></div>") +
      sec(4, L("Emotional needs", "भावनात्मक आवश्यकताएँ"), "<p>" + t(p.emotional) + "</p>" + both(function (x) { return x.emo.need; })) +
      sec(5, L("Communication styles and expectations", "संवाद शैली और अपेक्षाएँ"), "<p>" + t(p.communication) + "</p>" + both(function (x) { return x.comm.style; })) +
      sec(6, L("Independence and personal space", "स्वतंत्रता और निजी स्थान"), "<p>" + t(p.space) + "</p>") +
      sec(7, L("Trust and commitment", "विश्वास और प्रतिबद्धता"), "<p>" + t(p.trust) + "</p>") +
      sec(8, L("Potential behavioural friction", "संभावित व्यवहार घर्षण"), U.list(p.friction)) +
      sec(9, L("Conflict management and relationship suggestions", "टकराव प्रबंधन और संबंध सुझाव"), "<p>" + t(p.conflict) + "</p><h4>" + L("Mutual adjustment opportunities", "आपसी समायोजन के अवसर") + "</h4>" + U.list(p.adjust)) +
      sec(10, L("Mutual growth opportunities", "आपसी विकास के अवसर"), "<p>" + t(p.growth) + "</p>") + (NS.srm && NS.srm[a] && NS.srm[b] ? sec(11, L("Decision-making patterns", "निर्णय के प्रतिरूप"), both(function (x) { return NS.srm[x === A ? a : b].decision; })) + sec(12, L("Commitment expectations", "प्रतिबद्धता अपेक्षाएँ"), both(function (x) { return NS.srm[x === A ? a : b].commitment; })) : "") +
      '<div class="casebox"><p class="kick dark">' + L("ILLUSTRATIVE SITUATION", "उदाहरणात्मक स्थिति") + "</p><p>" + t(p.scenario) + "</p><h4>" + L("Questions both can discuss", "दोनों के लिए चर्चा प्रश्न") + "</h4>" + U.list(p.questions, "ol") + "</div></div>";
    h += "<label class='blk'><b>" + L("My notes on this pairing", "इस जोड़ी पर मेरे नोट") + '</b><textarea id="pnote" rows="3">' + esc(S.notes[key] || "") + "</textarea></label>";
    h += '<div class="pager noprint"><a class="btn" href="#/matrix">▦ ' + L("Matrix", "मैट्रिक्स") + '</a><button class="btn gold" id="pm">' + (S.marks[key] ? "✓ " + L("Studied (undo)", "पढ़ा गया (वापस लें)") : L("Mark as studied", "पढ़ा हुआ चिह्नित करें")) + '</button><a class="btn" href="#/pair/' + b + "/" + a + '">⇄ ' + b + a + "</a></div>";
    return { html: h, after: function () {
      $("pm").onclick = function () { if (S.marks[key]) delete S.marks[key]; else S.marks[key] = 1; U.save(); NS.go(true); };
      $("pnote").oninput = function () { S.notes[key] = this.value; U.save(); };
    } };
  };

  /* ---------- methods, wiki, frameworks, resources ---------- */
  V.methods = function (id) {
    var M = NS.methods || [];
    if (!id) return { html: head(L("REFERENCE", "संदर्भ"), L("Numerology methods used in this course", "कोर्स में प्रयुक्त अंक पद्धतियाँ"), L("Learn each system on its own terms, name it with every number, and never merge results silently.", "हर पद्धति को उसके नियमों से सीखें, हर अंक के साथ पद्धति लिखें और परिणाम चुपचाप न मिलाएँ।")) + '<div class="grid">' + M.map(function (m) { return '<a class="tile" href="#/methods/' + m.id + '"><b>' + t(m.title) + "</b><small>" + t(m.summary) + "</small></a>"; }).join("") + "</div>" + '<p><a class="btn gold" href="#/calc">' + L("Four-system calculator", "चार-पद्धति कैलकुलेटर") + '</a> <a class="btn" href="#/loshu">' + L("Lo Shu grid lab", "लो शू ग्रिड लैब") + "</a></p>" };
    var m = M.filter(function (x) { return x.id === id; })[0]; if (!m) return null;
    return { html: head(L("METHOD GUIDE", "पद्धति मार्गदर्शिका"), t(m.title), t(m.summary)) + '<div class="chips">' + M.map(function (x) { return '<a class="chip wide ' + (x.id === id ? "on" : "") + '" href="#/methods/' + x.id + '">' + t(x.title) + "</a>"; }).join("") + '</div><div class="reading">' + U.blocks(m.blocks) + "</div>" };
  };
  var GROUPS = { foundations: ["Foundations", "आधार"], methods: ["Methods", "पद्धतियाँ"], personality: ["Personality", "व्यक्तित्व"], emotion: ["Emotion", "भावना"], communication: ["Communication", "संवाद"], relationship: ["Relationship", "संबंध"], practice: ["Professional practice", "पेशेवर अभ्यास"], frameworks: ["Frameworks", "ढाँचे"] };
  V.wiki = function (id) {
    var W = NS.wiki || [];
    if (!id) {
      return { html: head(L("CONCEPT WIKI", "अवधारणा विकि"), L("Linked concept pages", "परस्पर जुड़े अवधारणा पृष्ठ") + " (" + W.length + ")", L("One idea per page, linked to related ideas. Archetypes, traits and the 81 pairings have their own linked libraries.", "हर पृष्ठ पर एक विचार, संबंधित विचारों से जुड़ा। आर्कटाइप, गुण और 81 जोड़ियों के अपने पुस्तकालय हैं।")) + '<input id="wq" type="search" class="wideinput" placeholder="' + L("Filter the wiki", "विकि में खोजें") + '">' + Object.keys(GROUPS).map(function (g) { var l = W.filter(function (w) { return w.group === g; }); return l.length ? '<section class="wg"><h3 class="sec">' + t(GROUPS[g]) + '</h3><div class="grid">' + l.map(function (w) { return '<a class="tile" href="#/wiki/' + w.id + '"><b>' + t(w.title) + "</b><small>" + t(w.summary) + "</small></a>"; }).join("") + "</div></section>" : ""; }).join("") + '<h3 class="sec">' + L("Linked libraries", "जुड़े पुस्तकालय") + "</h3>" + tiles(REF.slice(0, 4)), after: function () {
        $("wq").oninput = function () { var q = this.value.toLowerCase(); document.querySelectorAll(".wg").forEach(function (s) { var any = false; s.querySelectorAll(".tile").forEach(function (x) { var show = x.textContent.toLowerCase().indexOf(q) >= 0; x.hidden = !show; any = any || show; }); s.hidden = !any; }); };
      } };
    }
    var w = W.filter(function (x) { return x.id === id; })[0]; if (!w) return null;
    function links(l) { return '<div class="chips">' + l.map(function (x) { return '<a class="chip wide" href="#/wiki/' + x.id + '">' + t(x.title) + "</a>"; }).join("") + "</div>"; }
    var rel = (w.related || []).map(function (r) { return W.filter(function (x) { return x.id === r; })[0]; }).filter(Boolean), back = W.filter(function (x) { return (x.related || []).indexOf(id) >= 0 && rel.indexOf(x) < 0; });
    return { html: head('<a href="#/wiki">' + L("CONCEPT WIKI", "अवधारणा विकि") + "</a> · " + t(GROUPS[w.group] || w.group), t(w.title), t(w.summary)) + '<div class="reading">' + U.blocks(w.blocks) + (rel.length ? "<h3>" + L("Related concepts", "संबंधित अवधारणाएँ") + "</h3>" + links(rel) : "") + (back.length ? "<h3>" + L("Pages that link here", "यहाँ जोड़ने वाले पृष्ठ") + "</h3>" + links(back) : "") + "</div>" };
  };
  function flowCol(items) { return '<ol class="vflow">' + items.map(function (i) { return "<li>" + t(i) + "</li>"; }).join("") + "</ol>"; }
  V.frameworks = function () {
    var layers = [[["NUMERICAL IDENTITY", "अंक पहचान"], ["Birth Number • Destiny Number • Name Number", "मूलांक • भाग्यांक • नामांक"]], [["PERSONALITY ANALYSIS", "व्यक्तित्व विश्लेषण"], ["Traits • Strengths • Weaknesses • Behaviour", "गुण • शक्तियाँ • कमज़ोरियाँ • व्यवहार"]], [["EMOTIONAL ANALYSIS", "भावनात्मक विश्लेषण"], ["Needs • Expectations • Triggers • Reactions", "आवश्यकताएँ • अपेक्षाएँ • ट्रिगर • प्रतिक्रियाएँ"]], [["RELATIONSHIP STRESS ANALYSIS", "संबंध तनाव विश्लेषण"], ["Compatibility • Differences • Conflict • Friction", "अनुकूलता • अंतर • टकराव • घर्षण"]], [["RELATIONSHIP MANAGEMENT", "संबंध प्रबंधन"], ["Accept • Ignore • Adjust • Work upon", "स्वीकारें • अनदेखा • समायोजन • काम"]]];
    var h = head(NS.course.brand, L("Signature frameworks", "विशिष्ट ढाँचे")) + "<h3>1. " + L("Five-Layer Relationship Intelligence Model", "पाँच-परत संबंध बुद्धिमत्ता मॉडल") + '</h3><div class="model">' + layers.map(function (l, i) { var last = i === 4; return '<div class="layer' + (last ? " final" : "") + '"><b>' + L("LAYER ", "परत ") + (i + 1) + " – " + t(l[0]) + "</b><span>" + t(l[1]) + "</span></div>" + (last ? "" : '<div class="arrow" aria-hidden="true">↓</div>'); }).join("") + "</div>";
    h += "<h3>2. " + L("Relationship Stress Matrix: eight dimensions", "संबंध तनाव मैट्रिक्स: आठ आयाम") + "</h3>" + U.table([["Dimension", "आयाम"], ["What to assess", "क्या आकलन करें"]], NS.dimensions.map(function (d) { return [d.name, d.points[0]]; })) + '<p><a class="btn gold" href="#/compare">' + L("Open the matrix tool", "मैट्रिक्स टूल खोलें") + "</a></p>";
    h += "<h3>3. " + L("Four-Action Relationship Decision System", "चार-क्रिया संबंध निर्णय प्रणाली") + "</h3>" + U.table([["Action", "क्रिया"], ["Meaning", "अर्थ"], ["Examples", "उदाहरण"]], NS.actions.map(function (a) { return [a.name, a.text, a.ex]; })) + '<p class="note">' + L("Safety comes before every category: fear, violence, threats or control are never accepted or ignored.", "सुरक्षा हर श्रेणी से पहले है: भय, हिंसा, धमकी या नियंत्रण को कभी स्वीकार या अनदेखा नहीं किया जाता।") + '</p><p><a class="btn gold" href="#/decide">' + L("Open the decision tool", "निर्णय टूल खोलें") + "</a></p>";
    h += "<h3>4. " + L("30-Day Relationship Improvement Model", "30-दिन संबंध सुधार मॉडल") + "</h3>" + U.table([["Period", "अवधि"], ["Objective", "उद्देश्य"]], NS.PHASES.map(function (p) { return [lr("Days ", "दिन ") + p.from + "–" + (p.from + p.tasks.length - 1), p.name]; })) + '<p><a class="btn gold" href="#/plan30">' + L("Open the planner", "योजनाकार खोलें") + "</a></p>";
    h += "<h3>" + L("81 pairing matrix", "81 जोड़ी मैट्रिक्स") + "</h3>" + matrixHtml("");
    return { html: h };
  };
  V.resources = function () {
    var material = [[["Main handbook (the ten days)", "मुख्य पुस्तिका (दस दिन)"], "day/1"], [["Nine Numbers relationship behaviour dictionary", "नौ अंक संबंध व्यवहार कोश"], "arch"], [["Individual personality assessment worksheet", "व्यक्तिगत आकलन वर्कशीट"], "assess"], [["Couple compatibility assessment matrix", "युगल अनुकूलता आकलन मैट्रिक्स"], "compare"], [["Emotional needs and expectations workbook", "भावनात्मक आवश्यकता कार्यपुस्तिका"], "needs"], [["Relationship stress identification manual", "संबंध तनाव पहचान पुस्तिका"], "causes"], [["81 pairing reference library", "81 जोड़ी संदर्भ पुस्तकालय"], "matrix"], [["3 × 3 grid reference sheet", "3 × 3 ग्रिड संदर्भ पत्र"], "loshu"], [["Accept, Ignore, Adjust and Work Upon workbook", "चार-क्रिया कार्यपुस्तिका"], "decide"], [["30-day relationship improvement planner", "30-दिन सुधार योजनाकार"], "plan30"], [["Professional consultation manual", "पेशेवर परामर्श पुस्तिका"], "day/9"], [["Relationship report template", "संबंध रिपोर्ट प्रारूप"], "report"]];
    var h = head(L("REFERENCE", "संदर्भ"), L("Learning material and further reading", "अध्ययन सामग्री और आगे का पठन")) + "<h3>" + L("Course material inside this app", "इस ऐप में कोर्स सामग्री") + '</h3><div class="grid">' + material.map(function (m) { return '<a class="tile" href="#/' + m[1] + '"><b>' + t(m[0]) + "</b></a>"; }).join("") + "</div><h3>" + L("Supplementary manual plan", "पूरक पुस्तिका योजना") + "</h3><ol>" + NS.manuals.map(function (m) { return "<li>" + (m[2] ? '<a href="#/' + m[2] + '">' + t(m[1]) + "</a>" : t(m[1])) + "</li>"; }).join("") + "</ol><h3>" + L("Further reading", "आगे का पठन") + "</h3>" + U.list(NS.references) + '<p class="note">' + t(NS.referencesNote) + "</p>";
    return { html: h };
  };
  V.commchart = function () {
    var keys = Object.keys(U.P.comm), N = [1, 2, 3, 4, 5, 6, 7, 8, 9].filter(function (i) { return NS.num[i]; });
    return { html: head(L("REFERENCE CHART", "संदर्भ तालिका"), L("Nine numerical communication archetypes", "नौ अंक संवाद आर्कटाइप")) + keys.map(function (k) { return "<h3>" + t(U.P.comm[k]) + "</h3>" + U.table([["Number", "अंक"], U.P.comm[k]], N.map(function (i) { return [i + " · " + U.raw(NS.num[i].name), NS.num[i].comm[k]]; })); }).join("") };
  };

  /* ---------- progress, notes, settings ---------- */
  function quizAvg() { return DAYS.reduce(function (a, n) { return a + ((S.quiz[n] || {}).best || 0); }, 0) / (DAYS.length || 1); }
  V.progress = function () {
    function weighted() { var sum = 0, covered = 0; NS.assessment.forEach(function (a) { var v = a.id === "quiz" ? quizAvg() : S.marksIn[a.id]; if (v !== undefined && v !== "") { sum += a.w * v / 100; covered += a.w; } }); return { sum: Math.round(sum * 10) / 10, covered: covered }; }
    var h = head(L("MY LEARNING", "मेरी पढ़ाई"), L("Progress and assessment", "प्रगति और मूल्यांकन")) + '<div class="stats"><div><b>' + pct() + "%</b>" + L("modules complete", "मॉड्यूल पूर्ण") + "</div><div><b>" + daysComplete() + " / " + DAYS.length + "</b>" + L("days complete", "दिन पूर्ण") + "</div><div><b>" + Math.round(quizAvg()) + "%</b>" + L("quiz average (all days)", "क्विज़ औसत (सभी दिन)") + "</div><div><b>" + Object.keys(S.marks).filter(function (k) { return k.indexOf("pair:") === 0; }).length + " / 81</b>" + L("pairings studied", "जोड़ियाँ पढ़ीं") + "</div></div>";
    h += "<h3>" + L("Day by day", "दिनवार") + "</h3>" + '<div class="tw"><table><tr><th>' + L("Day", "दिन") + "</th><th>" + L("Modules", "मॉड्यूल") + "</th><th>" + L("Best quiz", "सर्वोत्तम क्विज़") + "</th></tr>" + DAYS.map(function (n) { return '<tr><td><a href="#/day/' + n + '">' + n + ". " + t(day(n).title) + "</a></td><td>" + dayDone(n) + "/" + day(n).modules.length + "</td><td>" + (S.quiz[n] ? S.quiz[n].best + "%" : "–") + "</td></tr>"; }).join("") + "</table></div>";
    h += "<h3>" + L("Method lab assessments", "पद्धति लैब परीक्षण") + "</h3>" + U.table([["System", "पद्धति"], ["Best score", "सर्वोत्तम अंक"], ["Attempts", "प्रयास"]], Object.keys(NS.METHODLABS).map(function (k) { var r = ((S.mlab || {}).test || {})[k]; return [NS.METHODLABS[k].name, r ? r.best + "%" : "–", r ? String(r.tries) : "0"]; }));
    h += "<h3>" + L("Study planner", "अध्ययन योजनाकार") + '</h3><div class="form"><label>' + L("Study sessions per week (about 60 minutes each)", "प्रति सप्ताह अध्ययन बैठकें (लगभग 60 मिनट)") + '<select id="pace">' + [1, 2, 3, 4, 5, 7].map(function (i) { return "<option" + (S.pace == i ? " selected" : "") + ">" + i + "</option>"; }).join("") + '</select></label></div><p id="paceOut" class="engine"></p>';
    h += "<h3>" + L("Assessment record", "मूल्यांकन अभिलेख") + '</h3><p class="small muted">' + L("Quiz marks fill in automatically. Enter the other marks (out of 100) as awarded by your instructor, or as an honest self-assessment.", "क्विज़ अंक स्वतः भरते हैं। बाकी अंक (100 में से) प्रशिक्षक के दिए हुए या ईमानदार स्व-आकलन से भरें।") + '</p><div class="tw"><table><tr><th>' + L("Assessment", "मूल्यांकन") + "</th><th>" + L("Weight", "भार") + "</th><th>" + L("Mark /100", "अंक /100") + "</th></tr>" + NS.assessment.map(function (a) { return "<tr><td>" + t(a.name) + "</td><td>" + a.w + "%</td><td>" + (a.id === "quiz" ? Math.round(quizAvg()) : '<input type="number" min="0" max="100" data-mark="' + a.id + '" value="' + esc(S.marksIn[a.id] === undefined ? "" : S.marksIn[a.id]) + '" aria-label="' + t(a.name) + '">') + "</td></tr>"; }).join("") + '</table></div><p id="wsum" class="formula"></p>';
    h += "<h3>" + L("Final capstone checklist", "अंतिम कैपस्टोन सूची") + "</h3>" + NS.capstone.map(function (c, i) { return '<label class="chk"><input type="checkbox" data-cap="' + i + '"' + (S.cap[i] ? " checked" : "") + "> " + t(c) + "</label>"; }).join("");
    h += "<h3>" + L("Study record", "अध्ययन अभिलेख") + '</h3><label class="blk">' + L("Your name", "आपका नाम") + '<input class="wideinput" id="lname" value="' + esc(S.name) + '"></label><div class="cert"><p class="kick dark">NUMEROSUTRAS</p><h3>' + t(NS.course.title) + '</h3><p class="name" id="certName">' + esc(S.name || "—") + "</p><p>" + pct() + "% " + L("of modules marked complete · quiz average ", "मॉड्यूल पूर्ण चिह्नित · क्विज़ औसत ") + Math.round(quizAvg()) + "%</p><p>" + L("Instructor: ", "प्रशिक्षक: ") + t(NS.instructor.name) + '</p><p class="small">' + L("Self-recorded study record. It is not a certificate; certification is decided by the instructor.", "यह स्व-दर्ज अध्ययन अभिलेख है, प्रमाणपत्र नहीं; प्रमाणन का निर्णय प्रशिक्षक करती हैं।") + '</p></div><button class="btn gold" data-print>' + L("Print / save as PDF", "प्रिंट / PDF सहेजें") + "</button>";
    return { html: h, after: function () {
      function sum() { var w = weighted(); $("wsum").textContent = lr("Weighted score so far: " + w.sum + " of " + w.covered + " marks entered (total scheme 100)", "अब तक भारित अंक: दर्ज " + w.covered + " में से " + w.sum + " (कुल योजना 100)"); }
      function pace() { var a = allModules().filter(function (x) { return !S.done[mkey(x.n, x.m.id)]; }), mins = a.reduce(function (s, x) { return s + x.m.mins; }, 0), sess = Math.ceil(mins / 60), weeks = Math.ceil(sess / S.pace); $("paceOut").textContent = lr("Planned time left: " + Math.round(mins / 6) / 10 + " hours, about " + sess + " sessions, or " + weeks + " weeks at this pace. Extra reading and exercises may add time.", "शेष नियोजित समय: " + Math.round(mins / 6) / 10 + " घंटे, लगभग " + sess + " बैठकें, इस गति से " + weeks + " सप्ताह। अतिरिक्त पठन और अभ्यास में अधिक समय लग सकता है।"); }
      $("pace").onchange = function () { S.pace = +this.value; U.save(); pace(); };
      document.querySelectorAll("[data-mark]").forEach(function (el) { el.oninput = function () { S.marksIn[el.dataset.mark] = el.value === "" ? "" : Math.max(0, Math.min(100, +el.value)); U.save(); sum(); }; });
      document.querySelectorAll("[data-cap]").forEach(function (el) { el.onchange = function () { S.cap[el.dataset.cap] = el.checked; U.save(); }; });
      $("lname").oninput = function () { S.name = this.value; U.save(); $("certName").textContent = this.value || "—"; };
      sum(); pace();
    } };
  };
  function keyLink(k) {
    if (k.indexOf("pair:") === 0) return ["#/pair/" + k.charAt(5) + "/" + k.charAt(6), lr("Pairing ", "जोड़ी ") + k.slice(5)];
    var p = k.split(":"), d = day(+p[0]), m = d && d.modules.filter(function (x) { return x.id === p[1]; })[0];
    return ["#/m/" + p[0] + "/" + p[1], dayTitle(p[0]) + " · " + p[1] + (m ? " " + U.raw(m.title) : "")];
  }
  V.notes = function () {
    var notes = Object.keys(S.notes).filter(function (k) { return S.notes[k]; }), marks = Object.keys(S.marks).filter(function (k) { return k.indexOf("pair:") !== 0; });
    var h = head(L("MY LEARNING", "मेरी पढ़ाई"), L("Notes and bookmarks", "नोट्स और बुकमार्क")) + "<h3>" + L("Bookmarks", "बुकमार्क") + "</h3>" + (marks.length ? "<ul>" + marks.map(function (k) { var l = keyLink(k); return '<li><a href="' + l[0] + '">' + esc(l[1]) + "</a></li>"; }).join("") + "</ul>" : '<p class="muted">' + L("No bookmarks yet.", "अभी कोई बुकमार्क नहीं।") + "</p>") + "<h3>" + L("My notes", "मेरे नोट") + "</h3>" + (notes.length ? notes.map(function (k) { var l = keyLink(k); return '<div class="casebox"><a href="' + l[0] + '"><b>' + esc(l[1]) + "</b></a><p>" + esc(S.notes[k]).replace(/\n/g, "<br>") + "</p></div>"; }).join("") + '<button class="btn" id="expNotes">' + L("Download notes", "नोट्स डाउनलोड करें") + "</button>" : '<p class="muted">' + L("Notes you type under a module appear here.", "मॉड्यूल के नीचे लिखे नोट यहाँ दिखेंगे।") + "</p>");
    return { html: h, after: function () { var b = $("expNotes"); if (b) b.onclick = function () { NS.download("NUMEROSUTRAS-notes.txt", "text/plain", "﻿" + notes.map(function (k) { return keyLink(k)[1] + "\r\n" + S.notes[k]; }).join("\r\n\r\n")); }; } };
  };
  V.settings = function () {
    var h = head(L("MY LEARNING", "मेरी पढ़ाई"), L("Settings and backup", "सेटिंग और बैकअप")) + "<h3>" + L("Reading comfort", "पढ़ने की सुविधा") + '</h3><div class="form"><label>' + L("Font size: ", "फ़ॉन्ट आकार: ") + '<span id="fsv">' + Math.round(S.fs * 100) + '%</span><input type="range" id="fsr" min="0.8" max="1.8" step="0.05" value="' + S.fs + '"></label></div><p>' + L("Language and light or dark theme are in the top bar.", "भाषा और लाइट या डार्क थीम ऊपर की पट्टी में हैं।") + "</p><h3>" + L("Backup and restore", "बैकअप और पुनर्स्थापन") + "</h3><p>" + L("Progress, notes and worksheets are stored only in this browser or app. Download a backup before changing phone or computer.", "प्रगति, नोट और वर्कशीट केवल इसी ब्राउज़र या ऐप में रहते हैं। फ़ोन या कंप्यूटर बदलने से पहले बैकअप लें।") + '</p><button class="btn gold" id="bk">' + L("Download backup", "बैकअप डाउनलोड करें") + '</button> <label class="btn">' + L("Restore from backup", "बैकअप से पुनर्स्थापित करें") + '<input type="file" id="rs" accept=".json,application/json" hidden></label> <button class="btn danger" id="wipe">' + L("Erase all my data", "मेरा सारा डेटा मिटाएँ") + "</button>";
    return { html: h, after: function () {
      $("fsr").oninput = function () { S.fs = +this.value; U.save(); applyPrefs(); $("fsv").textContent = Math.round(S.fs * 100) + "%"; };
      $("bk").onclick = function () { NS.download("NUMEROSUTRAS-backup.json", "application/json", JSON.stringify(S, null, 1)); };
      $("rs").onchange = function () {
        var f = this.files[0]; if (!f) return;
        var r = new FileReader(); r.onload = function () {
          try {
            var d = JSON.parse(r.result); if (!d || typeof d !== "object" || !d.done || !d.quiz) throw 0;
            if (!confirm(lr("Replace the data on this device with the backup?", "इस उपकरण का डेटा बैकअप से बदलें?"))) return;
            var clean = {};
            Object.keys(U.DEF).concat(["calc", "loshuIn", "mlab", "dob2"]).forEach(function (k) { var def = U.DEF[k], v = d[k]; if (v === undefined) return; if (def !== undefined && (typeof def !== typeof v || Array.isArray(def) !== Array.isArray(v))) return; clean[k] = v; });
            clean.fs = Math.max(0.8, Math.min(1.8, +clean.fs || 1));
            localStorage.setItem(U.KEY, JSON.stringify(clean)); location.reload();
          } catch (e) { alert(lr("That file is not a valid backup.", "यह सही बैकअप फ़ाइल नहीं है।")); }
        }; r.readAsText(f);
      };
      $("wipe").onclick = function () { if (confirm(lr("Erase all progress, notes and reports on this device? This cannot be undone.", "इस उपकरण की सारी प्रगति, नोट और रिपोर्ट मिटाएँ? इसे वापस नहीं लाया जा सकता।"))) { localStorage.removeItem(U.KEY); location.reload(); } };
    } };
  };

  /* ---------- search ---------- */
  function flat(v, out) { if (typeof v === "string") out.push(v); else if (v && typeof v === "object") Object.keys(v).forEach(function (k) { flat(v[k], out); }); return out; }
  var index = null;
  function buildIndex() {
    var li = S.lang === "hi" ? 1 : 0, a = [];
    function pick(v, out) { if (Array.isArray(v) && v.length === 2 && typeof v[0] === "string" && typeof v[1] === "string") out.push(v[li]); else if (v && typeof v === "object") Object.keys(v).forEach(function (k) { pick(v[k], out); }); return out; }
    function add(h, title, obj) { var text = title + " " + pick(obj, []).join(" "); a.push([h, title, text, text.toLowerCase()]); }
    allModules().forEach(function (x) { add("#/m/" + x.n + "/" + x.m.id, dayTitle(x.n) + " · " + x.m.id + " " + U.raw(x.m.title), x.m.blocks); });
    for (var n = 1; n <= 9; n++) if (NS.num[n]) add("#/arch/" + n, lr("Archetype ", "आर्कटाइप ") + n + " · " + U.raw(NS.num[n].name), NS.num[n]);
    (NS.traits || []).forEach(function (x) { add("#/trait/" + encodeURIComponent(x.n[0]), lr("Trait: ", "गुण: ") + U.raw(x.n), x); });
    Object.keys(NS.pairs || {}).forEach(function (k) { var p = k.split("-"); add("#/pair/" + p[0] + "/" + p[1], lr("Pairing ", "जोड़ी ") + p.join("") + " · " + U.raw(NS.pairs[k].title), NS.pairs[k]); });
    (NS.wiki || []).forEach(function (w) { add("#/wiki/" + w.id, lr("Wiki: ", "विकि: ") + U.raw(w.title), w); });
    (NS.causes || []).forEach(function (c, i) { add("#/causes", lr("Stress cause ", "तनाव कारण ") + (i + 1), c); });
    (NS.cases || []).forEach(function (c) { add("#/cases", lr("Case: ", "केस: ") + U.raw(c.title), c); });
    [1, 2, 3, 4, 5, 6, 7, 8, 9].forEach(function (n) { if (NS.srm && NS.srm[n]) add("#/arch/" + n + "/srm", lr("Number ", "अंक ") + n + lr(" stress guide", " तनाव मार्गदर्शिका"), NS.srm[n]); });
    DAYS.forEach(function (n) { var d = day(n); add("#/rev/" + n, dayTitle(n) + " · " + lr("Revision and FAQ", "पुनरावृत्ति और प्रश्नोत्तर"), [d.faq, d.glossary, d.practice, d.mistakes]); });
    (NS.methods || []).forEach(function (m) { add("#/methods/" + m.id, U.raw(m.title), m); });
    return a;
  }
  V.trait = function (name) { tf = { q: decodeURIComponent(name), c: "", n: "" }; return V.traits(); };
  V.search = function (q) {
    q = decodeURIComponent(q || "").trim();
    index = index || buildIndex();
    var words = q.toLowerCase().split(/\s+/).filter(Boolean);
    var hits = words.length ? index.filter(function (r) { return words.every(function (w) { return r[3].indexOf(w) >= 0; }); }).map(function (r) { var title = r[1].toLowerCase(); return [words.every(function (w) { return title.indexOf(w) >= 0; }) ? 0 : 1, r]; }).sort(function (a, b) { return a[0] - b[0]; }).map(function (x) { return x[1]; }) : [];
    return { html: head(L("SEARCH", "खोज"), esc(q), hits.length + " " + L("results", "परिणाम")) + hits.slice(0, 80).map(function (r) { var i = r[3].indexOf(words[0]), s = Math.max(0, i - 60); return '<a class="tile hit" href="' + r[0] + '"><b>' + esc(r[1]) + "</b><small>…" + esc(r[2].slice(s, s + 170).replace(/\*\*/g, "")) + "…</small></a>"; }).join("") };
  };

  /* ---------- router and chrome ---------- */
  function applyPrefs() {
    var th = S.theme || (window.matchMedia && matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    document.documentElement.dataset.theme = th;
    document.documentElement.style.setProperty("--fs", S.fs);
    document.documentElement.lang = S.lang;
    $("themeBtn").textContent = th === "dark" ? "☀" : "🌙";
    $("lang").value = S.lang;
    $("search").placeholder = lr("Search the whole course…", "पूरे कोर्स में खोजें…");
    $("foot").innerHTML = "<p>" + t(NS.credit) + '</p><button type="button" id="showDisc">' + L("Disclaimer", "अस्वीकरण") + "</button>";
    $("showDisc").onclick = gate;
  }
  NS.go = function (keepScroll) {
    var parts = (location.hash || "#/home").slice(2).split("/"), fn = V[parts[0]], page = null;
    var safe = ["home", "intro", "instructor", "day", "m", "quiz", "flash", "ws", "arch", "traits", "trait", "matrix", "pair", "methods", "wiki", "frameworks", "resources", "commchart", "calc", "loshu", "compare", "trigger", "assess", "report", "planner", "rev", "decide", "practice", "needs", "emap", "conflict", "plan30", "compound", "causes", "cases", "mlab", "xcompare", "progress", "notes", "settings", "search"];
    if (safe.indexOf(parts[0]) < 0) fn = null;
    if (window.speechSynthesis) speechSynthesis.cancel();
    window.onbeforeprint = null;
    try {
      var args = parts.slice(1).map(function (x, i) { return /^(day|rev|quiz|flash|ws)$/.test(parts[0]) || (parts[0] === "m" && i === 0) || (parts[0] === "arch" && i === 0) ? +x : x; });
      if (fn) page = fn.apply(null, args);
    } catch (e) { page = { html: '<p class="note">' + L("This page could not be shown.", "यह पृष्ठ नहीं दिखाया जा सका।") + " (" + esc(e.message) + ")</p>" }; if (window.console) console.error(e); }
    if (!page) page = V.home();
    var y = window.scrollY;
    $("page").innerHTML = page.html;
    if (page.after) page.after();
    $("side").innerHTML = sideHtml();
    $("side").classList.remove("open"); $("menu").setAttribute("aria-expanded", "false");
    $("pill").textContent = daysComplete() + "/" + DAYS.length;
    if (parts[0] === "m" || parts[0] === "pair") { S.last = location.hash; U.save(); }
    if (keepScroll === true) window.scrollTo(0, y); else window.scrollTo(0, 0);
    var h1 = document.querySelector("#page h1"); document.title = (h1 ? h1.textContent + " · " : "") + "NUMEROSUTRAS";
  };
  /* The disclaimer pops up every time the course is opened; the page behind stays inactive until it is accepted. */
  function behind(off) { ["top", "page", "sidewrap", "foot"].forEach(function (id) { var el = $(id); if (el) el.inert = off; }); }
  function gate() {
    var g = $("gate");
    g.hidden = false; behind(true);
    g.innerHTML = '<div class="modal" role="dialog" aria-modal="true" aria-labelledby="gh"><p class="kick dark">NUMEROSUTRAS</p><h2 id="gh">' + L("Disclaimer: please read before you begin", "अस्वीकरण: शुरू करने से पहले कृपया पढ़ें") + "</h2>" + U.list(NS.disclaimer) + '<p class="small muted">' + t(NS.credit) + '</p><button class="btn gold" id="agree">' + L("I have read and accept", "मैंने पढ़ लिया और स्वीकार करता/करती हूँ") + '</button> <button class="btn" id="gl">' + (S.lang === "hi" ? "English" : "हिन्दी") + "</button></div>";
    $("agree").onclick = function () { S.agreed = true; U.save(); g.hidden = true; behind(false); };
    $("gl").onclick = function () { setLang(S.lang === "hi" ? "en" : "hi"); gate(); };
    $("agree").focus({ preventScroll: true }); g.firstChild.scrollTop = 0;
  }
  function setLang(l) { S.lang = l; U.save(); index = null; applyPrefs(); NS.go(true); }
  function setFs(v) { S.fs = Math.round(Math.max(0.8, Math.min(1.8, v)) * 100) / 100; U.save(); applyPrefs(); }
  document.addEventListener("DOMContentLoaded", function () {
    $("lang").onchange = function () { setLang(this.value); };
    $("themeBtn").onclick = function () { S.theme = document.documentElement.dataset.theme === "dark" ? "light" : "dark"; U.save(); applyPrefs(); };
    $("fdn").onclick = function () { setFs(S.fs - 0.1); }; $("fup").onclick = function () { setFs(S.fs + 0.1); }; $("f0").onclick = function () { setFs(1); };
    $("menu").onclick = function () { var o = $("sidewrap").classList.toggle("open"); this.setAttribute("aria-expanded", o); };
    var timer;
    $("search").oninput = function () { var v = this.value.trim(); clearTimeout(timer); timer = setTimeout(function () { if (v.length > 1) { var h = "#/search/" + encodeURIComponent(v), mobileOpen = $("sidewrap").classList.contains("open"); history.replaceState(null, "", h); NS.go(); if (mobileOpen) $("sidewrap").classList.add("open"); } }, 350); };
    $("search").onkeydown = function (e) { if (e.key === "Enter") $("sidewrap").classList.remove("open"); };
    document.addEventListener("click", function (e) { if (e.target.closest && e.target.closest("[data-print]")) window.print(); });
    document.querySelector(".skip").onclick = function (e) { e.preventDefault(); $("main").focus(); };
    window.addEventListener("hashchange", function () { $("sidewrap").classList.remove("open"); NS.go(); });
    window.addEventListener("beforeprint", function () { document.querySelectorAll("#page details").forEach(function (d) { if (!d.open) { d.open = true; d.dataset.wasClosed = "1"; } }); });
    window.addEventListener("afterprint", function () { document.querySelectorAll("#page details[data-was-closed]").forEach(function (d) { d.open = false; delete d.dataset.wasClosed; }); });
    applyPrefs(); NS.go(); gate();
  });
})();

;
/* Offline support for the hosted (GitHub Pages) copy. Not used inside the Windows exe, which already holds every file. */
(function () {
  if (!("serviceWorker" in navigator)) return;
  if (location.hostname === "127.0.0.1" || location.protocol === "file:") return;
  window.addEventListener("load", function () { navigator.serviceWorker.register("sw.js").catch(function () { /* the app still works online */ }); });
})();
