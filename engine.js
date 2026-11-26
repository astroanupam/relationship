/* ===== core.js ===== */
/* NUMEROSUTRAS numerology engine: Vedic, Lo Shu, Pythagorean, Chaldean. Pure functions, no DOM. */
window.NS = window.NS || {};
(function () {
  var PY = {}; "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").forEach(function (c, i) { PY[c] = (i % 9) + 1; });
  var CH = { A: 1, B: 2, C: 3, D: 4, E: 5, F: 8, G: 3, H: 5, I: 1, J: 1, K: 2, L: 3, M: 4, N: 5, O: 7, P: 8, Q: 1, R: 2, S: 3, T: 4, U: 6, V: 6, W: 6, X: 5, Y: 1, Z: 7 };
  var VOWELS = "AEIOU";
  var PLANET = { 1: ["Sun", "सूर्य"], 2: ["Moon", "चन्द्र"], 3: ["Jupiter", "गुरु"], 4: ["Rahu", "राहु"], 5: ["Mercury", "बुध"], 6: ["Venus", "शुक्र"], 7: ["Ketu", "केतु"], 8: ["Saturn", "शनि"], 9: ["Mars", "मंगल"] };

  function digitSum(n) { return String(n).split("").reduce(function (a, d) { return a + (+d || 0); }, 0); }
  function reduce(n, keepMaster) {
    while (n > 9) { if (keepMaster && (n === 11 || n === 22 || n === 33)) return n; n = digitSum(n); }
    return n;
  }
  /* Steps such as 29 → 11 → 2, so the learner can follow the sum. */
  function chain(n, keepMaster) {
    var s = [n];
    while (n > 9) { if (keepMaster && (n === 11 || n === 22 || n === 33)) break; n = digitSum(n); s.push(n); }
    return s.join(" → ");
  }
  function parseDate(s) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s || ""); if (!m) return null;
    var y = +m[1], mo = +m[2], d = +m[3], t = new Date(Date.UTC(y, mo - 1, d));
    if (y < 1800 || y > 2200 || t.getUTCMonth() !== mo - 1 || t.getUTCDate() !== d) return null;
    return { y: y, m: mo, d: d, digits: (m[3] + m[2] + m[1]).split("").map(Number) };
  }
  function vedic(dob) {
    var p = parseDate(dob); if (!p) return null;
    var total = p.digits.reduce(function (a, b) { return a + b; }, 0);
    return { mulank: reduce(p.d), mulankSteps: chain(p.d), bhagyank: reduce(total), total: total,
      bhagyankSteps: p.digits.join("+") + " = " + chain(total) };
  }
  function letters(name) { return String(name || "").toUpperCase().replace(/[^A-Z]/g, "").split(""); }
  function sumLetters(list, table) { return list.reduce(function (a, c) { return a + table[c]; }, 0); }
  function nameWords(name) { return String(name || "").trim().split(/\s+/).filter(function (w) { return letters(w).length; }); }
  function breakdown(name, table) {
    return nameWords(name).map(function (w) {
      var l = letters(w), total = sumLetters(l, table);
      return { word: w, cells: l.map(function (c) { return [c, table[c]]; }), total: total, root: reduce(total) };
    });
  }
  function part(total) { return total ? { total: total, root: reduce(total), master: reduce(total, true), steps: chain(total) } : null; }
  function pythagorean(name, dob) {
    var out = { words: breakdown(name, PY) }, l = letters(name), p = parseDate(dob);
    out.expression = part(sumLetters(l, PY));
    out.soul = part(sumLetters(l.filter(function (c) { return VOWELS.indexOf(c) >= 0; }), PY));
    out.personality = part(sumLetters(l.filter(function (c) { return VOWELS.indexOf(c) < 0; }), PY));
    if (p) {
      var a = reduce(p.d, true), b = reduce(p.m, true), c = reduce(digitSum(p.y), true), t = a + b + c;
      out.lifePath = { total: t, root: reduce(t), master: reduce(t, true), steps: "day " + chain(p.d, true) + " ; month " + chain(p.m, true) + " ; year " + chain(digitSum(p.y), true) + " ; " + a + "+" + b + "+" + c + " = " + chain(t, true) };
      out.birthday = reduce(p.d);
    }
    return out;
  }
  function chaldean(name) {
    var words = breakdown(name, CH), total = sumLetters(letters(name), CH);
    return { words: words, compound: total, root: reduce(total), steps: chain(total) };
  }
  function kua(dob, formula) {
    var p = parseDate(dob); if (!p) return null;
    var early = p.m === 1 || (p.m === 2 && p.d <= 4), year = p.y;
    var y = reduce(digitSum(year)), k = formula === "f" ? reduce(y + 4) : reduce(11 - y);
    var raw = k;
    if (k === 5) k = formula === "f" ? 8 : 2;
    return { value: k, raw: raw, yearRoot: y, early: early };
  }
  var LOSHU_LAYOUT = [4, 9, 2, 3, 5, 7, 8, 1, 6];
  var PLANE_CELLS = { mental: [4, 9, 2], emotional: [3, 5, 7], practical: [8, 1, 6], thought: [4, 3, 8], will: [9, 5, 1], action: [2, 7, 6], diag456: [4, 5, 6], diag258: [2, 5, 8] };
  function loshu(dob, opt) {
    var p = parseDate(dob); if (!p) return null;
    opt = opt || {};
    var v = vedic(dob), counts = {}, added = [];
    for (var i = 1; i <= 9; i++) counts[i] = 0;
    p.digits.forEach(function (d) { if (d) counts[d]++; });
    if (opt.mulank) { counts[v.mulank]++; added.push(["Mulank", v.mulank]); }
    if (opt.bhagyank) { counts[v.bhagyank]++; added.push(["Bhagyank", v.bhagyank]); }
    if (opt.kua) { var k = kua(dob, opt.kua); counts[k.value]++; added.push(["Kua", k.value]); }
    var planes = Object.keys(PLANE_CELLS).map(function (key) {
      var have = PLANE_CELLS[key].filter(function (n) { return counts[n]; }).length;
      return { key: key, cells: PLANE_CELLS[key], have: have };
    });
    var all = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    return { counts: counts, added: added, planes: planes,
      missing: all.filter(function (n) { return !counts[n]; }), repeated: all.filter(function (n) { return counts[n] > 1; }) };
  }
  NS.engine = { reduce: reduce, chain: chain, parseDate: parseDate, vedic: vedic, pythagorean: pythagorean, chaldean: chaldean, kua: kua, loshu: loshu, LAYOUT: LOSHU_LAYOUT, PLANET: PLANET, PY: PY, CH: CH };
})();

;
/* ===== meta.js ===== */
/* Course identity, instructor, frameworks, assessment and introduction. */
window.NS = window.NS || {};
NS.course = {
  brand: "NUMEROSUTRAS",
  series: ["Advanced Master Classes Series 2026–2027", "एडवांस्ड मास्टर क्लास शृंखला 2026–2027"],
  level: ["Intermediate to advanced master course", "इंटरमीडिएट से एडवांस्ड मास्टर कोर्स"],
  title: ["Numerology for Stressed Relationship Management", "तनावग्रस्त संबंध प्रबंधन के लिए अंक ज्योतिष"],
  title2: ["Understand Yourself. Understand Your Partner. Strengthen Your Relationship.", "स्वयं को समझें। अपने साथी को समझें। अपने संबंध को मज़बूत करें।"],
  subtitle: ["Understanding behavioural patterns, emotional needs, compatibility and relationship differences through numerology.", "अंक ज्योतिष से व्यवहार प्रतिरूप, भावनात्मक आवश्यकताएँ, अनुकूलता और संबंधों के अंतर को समझना।"],
  tagline: ["Know what to accept, what to ignore, and what to work upon. 10 days, 20 hours, self-paced. Instructor: Shweta Vijayvarrgiya.", "जानें क्या स्वीकार करना है, क्या अनदेखा करना है और किस पर काम करना है। 10 दिन, 20 घंटे, अपनी गति से। प्रशिक्षक: श्वेता विजयवर्गीय।"],
  journey: [["Understand yourself", "स्वयं को समझें"], ["Understand your partner", "साथी को समझें"], ["See the differences", "अंतर पहचानें"], ["Recognise emotional needs", "भावनात्मक आवश्यकताएँ"], ["Understand compatibility", "अनुकूलता समझें"], ["Identify stress", "तनाव पहचानें"], ["Improve communication", "संवाद सुधारें"], ["Accept · Ignore · Adjust · Work upon", "स्वीकारें · अनदेखा · समायोजन · काम"]]
};
NS.instructor = {
  name: ["Shweta Vijayvarrgiya", "श्वेता विजयवर्गीय"],
  title: ["(NumeroSutras)", "(NumeroSutras)"],
  role: ["Course Instructor", "कोर्स प्रशिक्षक"],
  short: ["Postgraduate in Applied Mathematics, practising Numerologist, Author, Vastu Consultant and Researcher with over 15 years of professional experience.", "एप्लाइड मैथमेटिक्स में स्नातकोत्तर, प्रैक्टिसिंग अंक ज्योतिषी, लेखिका, वास्तु परामर्शदाता और शोधकर्ता; 15 वर्ष से अधिक का पेशेवर अनुभव।"],
  bio: [["Shweta Vijayvarrgiya is a postgraduate in Applied Mathematics, a practising Numerologist, Author, Vastu Consultant and Researcher with over 15 years of professional experience. Her academic foundation in mathematics inspired her early interest in Numerology and Astrology. She is deeply engaged in researching traditional astrological knowledge, particularly South Indian systems, and has guided clients worldwide through Numerology and Vastu consultations. Her approach blends mathematical logic, traditional wisdom and intuitive understanding to promote awareness and harmony.", "श्वेता विजयवर्गीय एप्लाइड मैथमेटिक्स में स्नातकोत्तर, प्रैक्टिसिंग अंक ज्योतिषी, लेखिका, वास्तु परामर्शदाता और शोधकर्ता हैं, जिनके पास 15 वर्ष से अधिक का पेशेवर अनुभव है। गणित की शैक्षणिक नींव ने अंक ज्योतिष और ज्योतिष में उनकी प्रारंभिक रुचि जगाई। वे पारंपरिक ज्योतिषीय ज्ञान, विशेषकर दक्षिण भारतीय पद्धतियों, के शोध में गहराई से संलग्न हैं और अंक ज्योतिष तथा वास्तु परामर्श के माध्यम से विश्वभर के लोगों का मार्गदर्शन कर चुकी हैं। उनका दृष्टिकोण गणितीय तर्क, पारंपरिक ज्ञान और सहज समझ को मिलाकर जागरूकता और सामंजस्य को बढ़ावा देता है।"]]
};
NS.credit = ["Course developed by Anoopam Shukla (AstroSutras) with Shweta Vijayvarrgiya (NumeroSutras)", "कोर्स विकास: अनूपम शुक्ला (AstroSutras), श्वेता विजयवर्गीय (NumeroSutras) के साथ"];
NS.disclaimer = [
  ["**Educational use.** This course is for learning, self-reflection and numerology study.", "**शैक्षणिक उपयोग।** यह कोर्स सीखने, आत्मचिंतन और अंक ज्योतिष के अध्ययन के लिए है।"],
  ["**No guarantee.** Numerology is a traditional interpretive framework. It is not a scientifically established predictor of behaviour, relationship success or marriage outcomes.", "**कोई गारंटी नहीं।** अंक ज्योतिष पारंपरिक व्याख्या का ढाँचा है। यह व्यवहार, संबंध की सफलता या विवाह के परिणाम का वैज्ञानिक रूप से सिद्ध पूर्वानुमान नहीं है।"],
  ["**Not professional advice.** Its observations are not psychological diagnoses, and nothing here is medical, legal or financial advice.", "**पेशेवर सलाह नहीं।** इसके अवलोकन मनोवैज्ञानिक निदान नहीं हैं, और यहाँ कुछ भी चिकित्सीय, कानूनी या वित्तीय सलाह नहीं है।"],
  ["**No verdict on people.** Compatibility is not a guarantee, a difference is not automatically a defect, and no number excuses harm.", "**लोगों पर कोई निर्णय नहीं।** अनुकूलता कोई गारंटी नहीं, हर अंतर दोष नहीं, और कोई अंक हानि पहुँचाने का बहाना नहीं।"],
  ["**Safety first.** Serious distress, abuse, coercion or any safety concern needs qualified help or emergency services. Never ignore harmful behaviour or stay in an unsafe relationship because of this course.", "**सुरक्षा पहले।** गंभीर मानसिक कष्ट, दुर्व्यवहार, दबाव या सुरक्षा की चिंता में योग्य सहायता या आपातकालीन सेवाएँ लें। इस कोर्स के कारण कभी हानिकारक व्यवहार को अनदेखा न करें और असुरक्षित संबंध में न रहें।"],
  ["**Privacy.** Use another person’s details only with consent. Your entries stay on this device. Schools of numerology may follow different rules.", "**निजता।** किसी अन्य व्यक्ति का विवरण उसकी सहमति से ही प्रयोग करें। आपकी प्रविष्टियाँ इसी उपकरण पर रहती हैं। अंक ज्योतिष के मत अलग नियम अपना सकते हैं।"]
];
NS.boundary = ["Numerology here is a traditional interpretive framework for reflection. It is not a psychological diagnosis or a guaranteed prediction. No number or pairing decides whether a relationship will succeed, and no number excuses harm. If anyone faces violence, abuse, threats, coercive control or a mental-health crisis, put safety first and seek qualified help or emergency services.", "यहाँ अंक ज्योतिष आत्मचिंतन का पारंपरिक व्याख्या-ढाँचा है। यह मनोवैज्ञानिक निदान या निश्चित भविष्यवाणी नहीं है। कोई अंक या जोड़ी संबंध की सफलता तय नहीं करती, और कोई अंक हानि का बहाना नहीं है। हिंसा, दुर्व्यवहार, धमकी, नियंत्रणकारी दबाव या मानसिक-स्वास्थ्य संकट में सुरक्षा पहले रखें और योग्य या आपातकालीन सहायता लें।"];
NS.intro = [
  { h: ["Why this course is needed", "यह कोर्स क्यों ज़रूरी है"] },
  { p: ["A compatibility result alone does not explain why a relationship feels repeated stress. What a learner needs is to understand the **interaction between two personalities**: where they differ, what each needs, what is harmless and what must change.", "केवल अनुकूलता का परिणाम यह नहीं बताता कि संबंध में बार-बार तनाव क्यों होता है। सीखने वाले को **दो व्यक्तित्वों की अंतःक्रिया** समझनी होती है: अंतर कहाँ है, किसे क्या चाहिए, क्या हानिरहित है और क्या बदलना ज़रूरी है।"] },
  { table: { head: [["Relationship problem", "संबंध समस्या"], ["Understanding required", "आवश्यक समझ"]], rows: [
    [["Frequent arguments", "बार-बार बहस"], ["Behaviour and communication differences", "व्यवहार और संवाद के अंतर"]], [["Emotional distance", "भावनात्मक दूरी"], ["Emotional needs and expression", "भावनात्मक आवश्यकता और अभिव्यक्ति"]], [["Possessiveness", "अधिकार-भाव"], ["Insecurity, boundaries and expectations", "असुरक्षा, सीमाएँ और अपेक्षाएँ"]], [["Lack of attention", "ध्यान की कमी"], ["Appreciation and emotional requirements", "सराहना और भावनात्मक ज़रूरतें"]], [["Excessive criticism", "अत्यधिक आलोचना"], ["Communication and behaviour tendencies", "संवाद और व्यवहार प्रवृत्तियाँ"]], [["Dominance", "वर्चस्व"], ["Authority and decision-making", "अधिकार और निर्णय"]], [["Lack of commitment", "प्रतिबद्धता की कमी"], ["Expectations and responsibility", "अपेक्षाएँ और ज़िम्मेदारी"]], [["Over-sensitivity", "अति-संवेदनशीलता"], ["Emotional responses and triggers", "भावनात्मक प्रतिक्रिया और ट्रिगर"]], [["Lack of personal space", "निजी स्थान की कमी"], ["Independence and boundaries", "स्वतंत्रता और सीमाएँ"]], [["Repeated misunderstandings", "बार-बार गलतफ़हमी"], ["Differences in interpretation", "अर्थ निकालने के अंतर"]]
  ] } },
  { h: ["Four fundamental principles", "चार मूल सिद्धांत"] },
  { ol: [["**Understand yourself:** your tendencies, expectations, reactions and habits.", "**स्वयं को समझें:** अपनी प्रवृत्तियाँ, अपेक्षाएँ, प्रतिक्रियाएँ और आदतें।"], ["**Understand your partner:** personality, emotional needs, communication and expectations.", "**साथी को समझें:** व्यक्तित्व, भावनात्मक आवश्यकताएँ, संवाद और अपेक्षाएँ।"], ["**Understand the relationship:** similarities, differences, friction, unmet expectations and cooperation.", "**संबंध को समझें:** समानताएँ, अंतर, घर्षण, अधूरी अपेक्षाएँ और सहयोग।"], ["**Manage the relationship:** practical acceptance, adjustment, communication and behaviour change.", "**संबंध का प्रबंधन करें:** स्वीकृति, समायोजन, संवाद और व्यवहार परिवर्तन।"]] },
  { key: ["The central question is not only whether two numbers are compatible. It is: **what should be accepted, what consciously ignored, what needs adjustment, and what behaviour truly needs to change?**", "मूल प्रश्न केवल यह नहीं कि दो अंक अनुकूल हैं या नहीं। प्रश्न है: **क्या स्वीकारें, क्या सोच-समझकर अनदेखा करें, कहाँ समायोजन चाहिए और कौन-सा व्यवहार सचमुच बदलना चाहिए?**"] },
  { h: ["Four competency levels this course builds", "कोर्स से बनने वाले चार दक्षता स्तर"] },
  { table: { head: [["Level", "स्तर"], ["Gap it closes", "कौन-सी कमी दूर होती है"]], rows: [
    [["1. Numerological knowledge", "1. अंक ज्ञान"], ["Reading several influences together instead of one number", "एक अंक के बजाय कई प्रभाव साथ पढ़ना"]], [["2. Personality understanding", "2. व्यक्तित्व समझ"], ["Telling personality from behaviour; seeing needs and patterns", "व्यक्तित्व और व्यवहार अलग करना; ज़रूरतें और प्रतिरूप देखना"]], [["3. Relationship assessment", "3. संबंध आकलन"], ["Finding the real source of friction; difference is not incompatibility", "घर्षण का असली स्रोत खोजना; अंतर असंगति नहीं"]], [["4. Practical management", "4. व्यावहारिक प्रबंधन"], ["Specific communication advice, individual plans and a consultation method", "ठोस संवाद सुझाव, निजी योजनाएँ और परामर्श पद्धति"]]
  ] } },
  { h: ["Who it is for", "किसके लिए"] },
  { p: ["Numerology students and practitioners, marriage and relationship consultants, family counsellors and educators, couples and individuals who want mutual understanding, and NUMEROSUTRAS software users.", "अंक ज्योतिष के विद्यार्थी और प्रैक्टिशनर, विवाह और संबंध परामर्शदाता, पारिवारिक परामर्शदाता और शिक्षक, आपसी समझ चाहने वाले व्यक्ति व युगल, और NUMEROSUTRAS सॉफ़्टवेयर उपयोगकर्ता।"] },
  { h: ["Measurable learning outcomes", "मापने योग्य सीखने के परिणाम"] },
  { ul: [["Prepare two individual numerological profiles.", "दो व्यक्तिगत अंक प्रोफ़ाइल बनाना।"], ["Identify at least five possible behaviour differences.", "कम से कम पाँच संभावित व्यवहार अंतर पहचानना।"], ["Map both people’s emotional expectations.", "दोनों की भावनात्मक अपेक्षाएँ दर्शाना।"], ["Identify three potential sources of friction.", "घर्षण के तीन संभावित स्रोत पहचानना।"], ["Complete a relationship compatibility matrix.", "संबंध अनुकूलता मैट्रिक्स पूरी करना।"], ["Classify issues as accept, ignore, adjust or work upon.", "मुद्दों को स्वीकारें, अनदेखा, समायोजन या काम में बाँटना।"], ["Prepare a practical 30-day improvement plan.", "व्यावहारिक 30-दिन सुधार योजना बनाना।"]] },
  { h: ["Before you start", "शुरू करने से पहले"] },
  { p: ["**Needed:** basic familiarity with numbers 1–9, interest in behaviour and relationships, and willingness to do case exercises. If you are new, first read the method guides and use the calculator; they work as your orientation.", "**आवश्यक:** 1–9 अंकों का आधारभूत परिचय, व्यवहार और संबंधों में रुचि और केस अभ्यास करने की इच्छा। यदि आप नए हैं, तो पहले पद्धति मार्गदर्शिकाएँ पढ़ें और कैलकुलेटर आज़माएँ; वही आपका परिचय पाठ है।"] },
  { h: ["How to study at your own pace", "अपनी गति से कैसे पढ़ें"] },
  { flow: [["Read one module", "एक मॉड्यूल पढ़ें"], ["Answer each self-check before revealing it", "उत्तर देखने से पहले सोचें"], ["Do the activity in your notes", "गतिविधि नोट्स में करें"], ["Mark the module complete", "मॉड्यूल पूर्ण चिह्नित करें"], ["Finish revision, quiz, flashcards and worksheet", "पुनरावृत्ति, क्विज़, फ्लैशकार्ड और वर्कशीट पूरी करें"]] },
  { p: ["Each day is planned as 120 minutes (90 core, 30 practical across the day’s modules). The expanded reading and all exercises can take longer; use as many sittings as you need.", "हर दिन 120 मिनट के लिए बना है (दिन के मॉड्यूलों में 90 मुख्य और 30 अभ्यास)। विस्तृत पठन और सभी अभ्यास में अधिक समय लग सकता है; जितनी बैठकें चाहें, लें।"] }
];
NS.teaching = [[["Conceptual teaching", "अवधारणा शिक्षण"], 45], [["Numerological interpretation", "अंक व्याख्या"], 25], [["Practical demonstration", "व्यावहारिक प्रदर्शन"], 20], [["Case studies and exercises", "केस स्टडी और अभ्यास"], 20], [["Discussion and knowledge check", "चर्चा और ज्ञान जाँच"], 10]];
NS.assessment = [
  { id: "quiz", w: 10, name: ["Daily knowledge tests", "दैनिक ज्ञान परीक्षण"] }, { id: "pers", w: 15, name: ["Individual personality assignments", "व्यक्तिगत व्यक्तित्व असाइनमेंट"] }, { id: "compat", w: 15, name: ["Partner compatibility analysis", "साथी अनुकूलता विश्लेषण"] },
  { id: "emo", w: 15, name: ["Emotional needs and stress assessment", "भावनात्मक आवश्यकता और तनाव आकलन"] }, { id: "cases", w: 20, name: ["Relationship case studies", "संबंध केस अध्ययन"] }, { id: "capstone", w: 25, name: ["Final capstone project", "अंतिम कैपस्टोन परियोजना"] }
];
NS.capstone = [["Project A: Individual numerological personality assessment", "परियोजना A: व्यक्तिगत अंक व्यक्तित्व आकलन"], ["Project B: Two profiles and a comparative relationship analysis", "परियोजना B: दो प्रोफ़ाइल और तुलनात्मक संबंध विश्लेषण"], ["Project C: Five potential stress areas with reasoning", "परियोजना C: पाँच संभावित तनाव क्षेत्र, कारण सहित"], ["Project D: Accept / Ignore / Adjust / Work Upon matrix", "परियोजना D: स्वीकारें / अनदेखा / समायोजन / काम मैट्रिक्स"], ["Project E: 30-day plan with measurable behaviour objectives", "परियोजना E: मापने योग्य लक्ष्यों वाली 30-दिन योजना"], ["Project F: Professional presentation of the assessment", "परियोजना F: आकलन की पेशेवर प्रस्तुति"]];
/* The eight dimensions of the Relationship Stress Matrix (Framework 2). */
NS.dimensions = [
  { name: ["Personality", "व्यक्तित्व"], points: [["Individual behaviour tendencies", "व्यक्तिगत व्यवहार प्रवृत्तियाँ"]] }, { name: ["Emotional", "भावनात्मक"], points: [["Unmet emotional needs", "अधूरी भावनात्मक आवश्यकताएँ"]] },
  { name: ["Communication", "संवाद"], points: [["Expression and listening differences", "अभिव्यक्ति और सुनने के अंतर"]] }, { name: ["Expectations", "अपेक्षाएँ"], points: [["What each person requires", "हर व्यक्ति को क्या चाहिए"], ["Commitment", "प्रतिबद्धता"], ["Family", "परिवार"]] },
  { name: ["Lifestyle", "जीवनशैली"], points: [["Routine and priorities", "दिनचर्या और प्राथमिकताएँ"], ["Money habits", "धन की आदतें"]] }, { name: ["Responsibility", "ज़िम्मेदारी"], points: [["Shared and individual duties", "साझा और निजी कर्तव्य"], ["Decision-making", "निर्णय लेना"]] },
  { name: ["Independence", "स्वतंत्रता"], points: [["Freedom and boundaries", "आज़ादी और सीमाएँ"]] }, { name: ["Behaviour", "व्यवहार"], points: [["Repeated habits and responses", "बार-बार की आदतें और प्रतिक्रियाएँ"]] }
];
NS.actions = [
  { id: "accept", name: ["Accept", "स्वीकारें"], text: ["Understand and respect harmless individual differences.", "हानिरहित व्यक्तिगत अंतर को समझें और सम्मान दें।"], ex: ["Different temperaments, harmless preferences, individual identity", "अलग स्वभाव, हानिरहित पसंद, निजी पहचान"] },
  { id: "ignore", name: ["Ignore", "अनदेखा करें"], text: ["Avoid needless arguments over insignificant matters.", "तुच्छ बातों पर अनावश्यक बहस से बचें।"], ex: ["Minor, harmless habits and small differences", "छोटी, हानिरहित आदतें और मामूली अंतर"] },
  { id: "adjust", name: ["Adjust", "समायोजन करें"], text: ["Negotiate a practical solution and build mutual understanding.", "व्यावहारिक हल पर बातचीत करें और आपसी समझ बनाएँ।"], ex: ["Communication habits, routines, expectations, shared duties", "संवाद आदतें, दिनचर्या, अपेक्षाएँ, साझा कर्तव्य"] },
  { id: "work", name: ["Work upon", "काम करें"], text: ["Address harmful, repeated or destructive behaviour patterns.", "हानिकारक, बार-बार या विनाशकारी व्यवहार पर काम करें।"], ex: ["Disrespect, control, dishonesty, unresolved conflict", "अनादर, नियंत्रण, बेईमानी, अनसुलझा टकराव"] }
];
NS.references = [["Further reading on emotional intelligence, listening and conflict skills from recognised psychology and relationship-education organisations.", "भावनात्मक बुद्धिमत्ता, सुनने और टकराव-कौशल पर मान्य मनोविज्ञान और संबंध-शिक्षा संस्थाओं का पठन।"]];
NS.referencesNote = ["Such reading supports only the emotional and communication skills. It does not validate numerological personality interpretation. Check any source yourself before citing it.", "ऐसा पठन केवल भावनात्मक और संवाद कौशल में सहायक है। यह अंक आधारित व्यक्तित्व व्याख्या को प्रमाणित नहीं करता। किसी भी स्रोत को उद्धृत करने से पहले स्वयं जाँचें।"];
NS.manuals = [
  [1, ["Nine Numbers: Complete Relationship Personality Dictionary", "नौ अंक: संपूर्ण संबंध व्यक्तित्व कोश"], "arch"], [2, ["81 Numerological Relationship Combinations", "81 अंक संबंध संयोजन"], "matrix"], [3, ["100 Common Causes of Relationship Stress", "संबंध तनाव के 100 सामान्य कारण"], "causes"],
  [4, ["Emotional Needs and Expectations Through Numerology", "अंक ज्योतिष से भावनात्मक आवश्यकताएँ और अपेक्षाएँ"], "needs"], [5, ["Communication and Conflict Patterns", "संवाद और टकराव प्रतिरूप"], "commchart"], [6, ["Numerology for Marriage and Married Life", "विवाह और दांपत्य के लिए अंक ज्योतिष"], "day/9"],
  [7, ["Family and Parent-Child Relationship Analysis", "पारिवारिक और माता-पिता-संतान संबंध विश्लेषण"], "day/9"], [8, ["Accept, Ignore, Adjust and Work Upon: Practical Workbook", "स्वीकारें, अनदेखा, समायोजन, काम: अभ्यास पुस्तिका"], "decide"], [9, ["Professional Relationship Consultation Handbook", "पेशेवर संबंध परामर्श पुस्तिका"], "day/9"], [10, ["Couple Assessment and Reporting Manual", "युगल आकलन और रिपोर्ट पुस्तिका"], "report"]
];

;
/* ===== render.js ===== */
/* Shared helpers: language, saved state, safe HTML, lesson blocks, library sections. */
(function () {
  var KEY = "numerosutras.srm.v1";
  var S;
  try { S = JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { S = {}; }
  var DEF = { lang: "en", theme: "", fs: 1, name: "", agreed: false, done: {}, quiz: {}, flash: {}, notes: {}, marks: {}, ws: {}, marksIn: {}, cap: {}, triggers: [], assess: [], compare: {}, report: {}, plan: {}, last: "", pace: 3, decisions: [], needs: { a: {}, b: {}, n: {} }, conflicts: [], plan30: { done: {}, note: {}, goals: [], start: "" } };
  Object.keys(DEF).forEach(function (k) { if (S[k] === undefined) S[k] = JSON.parse(JSON.stringify(DEF[k])); });
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* storage blocked: the app still works for this session */ } }

  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function raw(p) { if (p == null) return ""; if (typeof p === "string" || typeof p === "number") return String(p); return p[S.lang === "hi" ? 1 : 0] || p[0] || ""; }
  function t(p) { return esc(raw(p)).replace(/\*\*(.+?)\*\*/g, "<b>$1</b>"); }
  function L(en, hi) { return esc(S.lang === "hi" ? hi : en); }
  function lr(en, hi) { return S.lang === "hi" ? hi : en; }
  function list(items, tag) { tag = tag || "ul"; return "<" + tag + ">" + (items || []).map(function (i) { return "<li>" + t(i) + "</li>"; }).join("") + "</" + tag + ">"; }
  function table(head, rows) {
    return '<div class="tw"><table>' + (head ? "<thead><tr>" + head.map(function (h) { return "<th>" + t(h) + "</th>"; }).join("") + "</tr></thead>" : "") +
      "<tbody>" + (rows || []).map(function (r) { return "<tr>" + r.map(function (c) { return "<td>" + t(c) + "</td>"; }).join("") + "</tr>"; }).join("") + "</tbody></table></div>";
  }
  function dl(items) { return '<dl class="defs">' + (items || []).map(function (r) { return "<div><dt>" + t(r[0]) + "</dt><dd>" + t(r[1]) + "</dd></div>"; }).join("") + "</dl>"; }

  var TOOLS = {
    calc: ["Open the four-system calculator", "चार-पद्धति कैलकुलेटर खोलें"], loshu: ["Open the Lo Shu grid lab", "लो शू ग्रिड लैब खोलें"],
    compare: ["Open the two-person assessment", "दो-व्यक्ति आकलन खोलें"], matrix: ["Open the 81 pairing matrix", "81 जोड़ी मैट्रिक्स खोलें"],
    trigger: ["Open the trigger mapping diary", "ट्रिगर मानचित्र डायरी खोलें"], traits: ["Open the trait dictionary", "गुण कोश खोलें"],
    archetypes: ["Open the nine archetype library", "नौ आर्कटाइप पुस्तकालय खोलें"], assess: ["Open the positive-negative assessment matrix", "सकारात्मक-नकारात्मक आकलन मैट्रिक्स खोलें"],
    report: ["Open the report builder", "रिपोर्ट निर्माता खोलें"], planner: ["Open the growth planner", "विकास योजनाकार खोलें"], methods: ["Open the method guides", "पद्धति मार्गदर्शिकाएँ खोलें"]
  };
  var TOOLHASH = { archetypes: "arch", stress: "compare" };
  ["decide", "emap", "needs", "conflict", "plan30", "compound", "causes", "cases", "stress"].forEach(function (k) { TOOLS[k] = [k, k]; });

  var P = {
    pressure: { disagreement: ["Disagreement", "असहमति"], criticism: ["Criticism", "आलोचना"], rejection: ["Rejection", "अस्वीकृति"], uncertainty: ["Uncertainty", "अनिश्चितता"], money: ["Financial stress", "आर्थिक तनाव"], emotional: ["Emotional conflict", "भावनात्मक टकराव"], unmet: ["Unmet expectations", "अधूरी अपेक्षाएँ"], boundary: ["Boundaries challenged", "सीमाओं को चुनौती"] },
    comm: { style: ["Preferred style", "पसंदीदा शैली"], affection: ["Expressing affection", "स्नेह की अभिव्यक्ति"], criticism: ["Response to criticism", "आलोचना पर प्रतिक्रिया"], disagreement: ["Response to disagreement", "असहमति पर प्रतिक्रिया"], listening: ["Listening", "सुनने का व्यवहार"], expression: ["Emotional expression", "भाव अभिव्यक्ति"], stress: ["Under stress", "तनाव में"], conflict: ["In conflict", "टकराव में"], appreciation: ["Need for appreciation", "सराहना की आवश्यकता"], improve: ["Improvement", "सुधार"] },
    life: { romance: ["Marriage and romantic relationships", "विवाह और प्रेम संबंध"], parentchild: ["Parent and child", "माता-पिता और संतान"], family: ["Family", "परिवार"], work: ["Professional", "कार्यस्थल"], business: ["Business partnership", "व्यावसायिक साझेदारी"] }
  };
  var PARTS = {
    core: ["Core personality", "मूल व्यक्तित्व"], pos: ["Positive traits", "सकारात्मक गुण"], neg: ["Challenging traits", "चुनौतीपूर्ण गुण"], relation: ["Emotional and relationship dimensions", "भावनात्मक और संबंध आयाम"],
    improve: ["Improvement framework", "सुधार ढाँचा"], emo: ["Emotional profile", "भावनात्मक प्रोफ़ाइल"], comm: ["Communication style", "संवाद शैली"], shadow: ["Shadow dimension", "छाया पक्ष"],
    pressure: ["Behaviour under pressure", "दबाव में व्यवहार"], manage: ["Relationship management", "संबंध प्रबंधन"], life: ["In life situations", "जीवन की स्थितियों में"]
  };
  function archPart(n, part) {
    var a = NS.num && NS.num[n]; if (!a || !a[part]) return "";
    var v = a[part], h = "";
    if (part === "core" || part === "relation") h = dl(v);
    else if (part === "pos") h = '<div class="pn pos">' + dl(v) + "</div>";
    else if (part === "neg") h = '<div class="pn neg">' + dl(v) + "</div>";
    else if (part === "improve") h = dl(v);
    else if (part === "emo") h = dl([[["Emotional requirement", "भावनात्मक आवश्यकता"], v.need], [["Emotional challenge", "भावनात्मक चुनौती"], v.challenge]]) + "<h4>" + L("Possible triggers", "संभावित ट्रिगर") + "</h4>" + list(v.triggers) + "<h4>" + L("Possible responses", "संभावित प्रतिक्रियाएँ") + "</h4>" + list(v.responses) + "<h4>" + L("Regulation practices", "भाव-नियमन अभ्यास") + "</h4>" + list(v.regulate);
    else if (part === "comm" || part === "life" || part === "pressure") h = dl(Object.keys(P[part]).filter(function (k) { return v[k]; }).map(function (k) { return [P[part][k], v[k]]; }));
    else if (part === "shadow") h = "<p><b>" + t(v.title) + "</b></p><p>" + t(v.text) + "</p><p><b>" + L("Underlying concern: ", "भीतर की चिंता: ") + "</b>" + t(v.fear) + "</p><h4>" + L("Observable signs", "दिखने वाले संकेत") + "</h4>" + list(v.signs) + "<h4>" + L("Reflection questions", "आत्मचिंतन प्रश्न") + "</h4>" + list(v.reflect, "ol");
    else if (part === "manage") h = "<p><b>" + L("Key objective: ", "मुख्य लक्ष्य: ") + "</b>" + t(v.objective) + '</p><div class="duo"><div class="pos"><h4>' + L("Practise", "अभ्यास करें") + "</h4>" + list(v.practise) + '</div><div class="neg"><h4>' + L("Watch for", "सावधान रहें") + "</h4>" + list(v.avoid) + "</div></div><h4>" + L("How others can relate well", "दूसरे अच्छा व्यवहार कैसे करें") + "</h4>" + list(v.relate);
    return h;
  }

  var checkSeq = 0;
  function block(b) {
    if (!b) return "";
    if (b.h) return "<h3>" + t(b.h) + "</h3>";
    if (b.p) return "<p>" + t(b.p) + "</p>";
    if (b.ul) return list(b.ul);
    if (b.ol) return list(b.ol, "ol");
    if (b.table) return table(b.table.head, b.table.rows);
    if (b.key) return '<div class="keybox"><b>' + L("Key idea", "मुख्य विचार") + "</b> " + t(b.key) + "</div>";
    if (b.warn) return '<div class="note"><b>' + L("Interpretation boundary", "व्याख्या की सीमा") + "</b> " + t(b.warn) + "</div>";
    if (b.flow) return '<ol class="vflow">' + b.flow.map(function (i) { return "<li>" + t(i) + "</li>"; }).join("") + "</ol>";
    if (b.duo) return '<div class="duo"><div class="pos"><h4>✓ ' + t(b.duo.pos[0]) + "</h4>" + list(b.duo.pos[1]) + '</div><div class="neg"><h4>! ' + t(b.duo.neg[0]) + "</h4>" + list(b.duo.neg[1]) + "</div></div>";
    if (b.script) return '<div class="script"><b>' + t(b.script.title) + "</b>" + (b.script.lines || []).map(function (l) { return "<p><span>" + t(l[0]) + ":</span> " + t(l[1]) + "</p>"; }).join("") + "</div>";
    if (b["case"]) { var c = b["case"]; return '<div class="casebox"><p class="kick dark">' + L("ILLUSTRATIVE CASE", "उदाहरणात्मक केस") + "</p><h4>" + t(c.title) + "</h4><p>" + t(c.story) + "</p>" + list(c.questions, "ol") + "<details><summary>" + L("Think first, then reveal the discussion", "पहले सोचें, फिर चर्चा देखें") + "</summary><p>" + t(c.analysis) + "</p></details></div>"; }
    if (b.activity) return '<div class="activity"><p class="kick dark">' + L("YOUR TURN", "अब आपकी बारी") + "</p><h4>" + t(b.activity.title) + "</h4>" + list(b.activity.steps, "ol") + "</div>";
    if (b.check) return '<details class="check"><summary><b>' + L("Self-check: ", "स्वयं जाँचें: ") + "</b>" + t(b.check.q) + '</summary><p class="why">' + t(b.check.a) + "</p></details>";
    if (b.arche) { var n = b.arche.n, a = NS.num && NS.num[n]; if (!a) return ""; return (b.arche.parts || []).map(function (p) { var h = archPart(n, p); return h ? '<details class="lib" open><summary>' + n + " · " + t(a.name) + ": " + t(PARTS[p]) + "</summary>" + h + "</details>" : ""; }).join(""); }
    if (b.tool && TOOLS[b.tool]) return '<p><a class="btn gold" href="#/' + (TOOLHASH[b.tool] || b.tool) + '">' + t(TOOLS[b.tool]) + "</a></p>";
    return "";
  }
  function blocks(arr) { return (arr || []).map(block).join(""); }

  /* Content checker used while testing: reports malformed bilingual strings and unknown blocks. */
  function validate() {
    var bad = [], KNOWN = ["h", "p", "ul", "ol", "table", "key", "warn", "flow", "duo", "script", "case", "activity", "check", "arche", "tool"];
    function walk(v, path) {
      if (Array.isArray(v)) {
        if (v.length === 2 && typeof v[0] === "string" && typeof v[1] === "string") { if (!/[ऀ-ॿ]/.test(v[1]) && /[a-z]{4}/.test(v[1]) && /traits|num|pairs|days|wiki|methods|compound|loshu|planes/.test(path) && !/\.(a|related|parts)$/.test(path.replace(/\[\d+\]/g, ""))) bad.push(path + " : no Hindi: " + v[1].slice(0, 40)); return; }
        v.forEach(function (x, i) { if (x === undefined) bad.push(path + "[" + i + "] hole"); else walk(x, path + "[" + i + "]"); });
      } else if (v && typeof v === "object") Object.keys(v).forEach(function (k) { if (k !== "related" && k !== "parts") walk(v[k], path + "." + k); });
    }
    ["num", "traits", "pairs", "days", "wiki", "methods", "compound", "loshu", "planes"].forEach(function (k) { if (!NS[k]) bad.push("missing NS." + k); else walk(NS[k], k); });
    function checkBlocks(a, path) { (a || []).forEach(function (b, i) { var k = Object.keys(b || {}); if (k.length !== 1 || KNOWN.indexOf(k[0]) < 0) bad.push(path + "[" + i + "] unknown block " + k.join(",")); else if (!block(b)) bad.push(path + "[" + i + "] renders empty " + k[0]); }); }
    for (var d = 1; d <= 10; d++) {
      var day = NS.days && NS.days[d]; if (!day) { bad.push("missing day " + d); continue; }
      var mins = 0; day.modules.forEach(function (m) { mins += m.mins; try { checkBlocks(m.blocks, "day" + d + "." + m.id); } catch (e) { bad.push("day" + d + "." + m.id + " " + e.message); } });
      if (mins !== 120) bad.push("day " + d + " minutes " + mins);
      if (!day.quiz || day.quiz.length < 20) bad.push("day " + d + " quiz " + (day.quiz || []).length);
      (day.quiz || []).forEach(function (q, i) { if (!q.o || q.o.length !== 4 || !(q.a >= 0 && q.a < 4)) bad.push("day " + d + " q" + i + " options"); });
      ["flash", "reflect", "worksheet", "objectives", "instructor", "summary", "mistakes", "faq", "practice", "glossary"].forEach(function (k) { if (!day[k]) bad.push("day " + d + " missing " + k); });
    }
    (NS.methods || []).forEach(function (m) { checkBlocks(m.blocks, "method." + m.id); });
    var ids = {}; (NS.wiki || []).forEach(function (w) { if (ids[w.id]) bad.push("wiki dup " + w.id); ids[w.id] = 1; checkBlocks(w.blocks, "wiki." + w.id); });
    (NS.wiki || []).forEach(function (w) { (w.related || []).forEach(function (r) { if (!ids[r]) bad.push("wiki " + w.id + " broken link " + r); }); });
    for (var a = 1; a <= 9; a++) {
      var num = NS.num && NS.num[a]; if (!num) { bad.push("missing number " + a); continue; }
      ["name", "area", "planet", "keywords", "essence", "balanced", "core", "pos", "neg", "relation", "improve", "emo", "comm", "shadow", "pressure", "manage", "life", "story"].forEach(function (k) { if (!num[k]) bad.push("num " + a + " missing " + k); });
      ["core", "pos", "neg"].forEach(function (k) { if (num[k] && num[k].length < 10) bad.push("num " + a + " " + k + " " + num[k].length); });
      Object.keys(P).forEach(function (g) { Object.keys(P[g]).forEach(function (k) { if (num[g] && !num[g][k]) bad.push("num " + a + " " + g + "." + k); }); });
      for (var b = a; b <= 9; b++) {
        var pr = NS.pairs && NS.pairs[a + "-" + b]; if (!pr) { bad.push("missing pair " + a + "-" + b); continue; }
        ["title", "core", "shared", "contrast", "emotional", "communication", "space", "trust", "friction", "conflict", "adjust", "growth", "scenario", "questions"].forEach(function (k) { if (!pr[k]) bad.push("pair " + a + "-" + b + " missing " + k); });
      }
    }
    (NS.traits || []).forEach(function (x, i) { ["n", "c", "a", "d", "p", "x", "o", "r", "i"].forEach(function (k) { if (!x[k]) bad.push("trait " + i + " missing " + k); }); });
    return bad;
  }

  NS.ui = { S: S, save: save, esc: esc, t: t, raw: raw, L: L, lr: lr, list: list, table: table, dl: dl, block: block, blocks: blocks, archPart: archPart, PARTS: PARTS, P: P, TOOLS: TOOLS, validate: validate, KEY: KEY, DEF: DEF };
})();

;
/* ===== toolnames.js ===== */
/* Button labels for the lab links used inside lessons. */
(function () {
  var T = NS.ui.TOOLS;
  function set(k, en, hi) { T[k] = [en, hi]; }
  set("calc", "Open the four-system calculator", "चार-पद्धति कैलकुलेटर खोलें");
  set("loshu", "Open the 3 × 3 grid lab (both grids)", "3 × 3 ग्रिड लैब खोलें (दोनों ग्रिड)");
  set("compare", "Open the eight-dimension couple assessment", "आठ-आयाम युगल आकलन खोलें");
  set("stress", "Open the Relationship Stress Matrix", "संबंध तनाव मैट्रिक्स खोलें");
  set("decide", "Open the Accept / Ignore / Adjust / Work Upon tool", "स्वीकारें / अनदेखा / समायोजन / काम टूल खोलें");
  set("emap", "Open the emotional stress map", "भावनात्मक तनाव मानचित्र खोलें");
  set("trigger", "Open the emotional stress map", "भावनात्मक तनाव मानचित्र खोलें");
  set("needs", "Open the couple emotional needs comparison", "युगल भावनात्मक आवश्यकता तुलना खोलें");
  set("conflict", "Open the ten-question conflict map", "दस-प्रश्न टकराव मानचित्र खोलें");
  set("plan30", "Open the 30-day planner", "30-दिन योजनाकार खोलें");
  set("compound", "Open the compound number library", "संयुक्त अंक पुस्तकालय खोलें");
  set("causes", "Open the 100 stress causes", "तनाव के 100 कारण खोलें");
  set("cases", "Open the case study library", "केस स्टडी पुस्तकालय खोलें");
})();

;
