const languageOptions = [
  { code: "en", label: "English" },
  { code: "yo", label: "Yorùbá" },
  { code: "ha", label: "Hausa" },
  { code: "ig", label: "Igbo" },
  { code: "pcm", label: "Pidgin" }
];

const translations = {
  en: {
    languageLabel: "Language:",
    tagline: "Practical AI skills for work, business and school in Nigeria",
    selectTrack: "Select your learning track",
    businessTrack: "AI for Business Owners",
    studentTrack: "AI for Students & Job Seekers",
    lessonTitle: {
      business: "What is AI and how can it help a small business in Nigeria?",
      students: "What is AI and why does it matter for students and job seekers?"
    },
    lessonBody: {
      business:
        "Artificial Intelligence (AI) is technology that helps people work faster and better. For a small business in Nigeria, AI can help with WhatsApp customer replies, marketing ideas, product descriptions, simple proposals, and day-to-day productivity. It should be used responsibly, without sharing sensitive customer or bank data.",
      students:
        "Artificial Intelligence (AI) is technology that can help you learn faster, research better, organise ideas, improve writing, and prepare for school and work. For students and job seekers in Nigeria, AI can support CV writing, interview practice, research summaries, and productivity, but you should still verify facts and avoid plagiarism."
    },
    lessonNext: "Next",
    quizTitle: {
      business: "Quiz: AI for Business",
      students: "Quiz: AI for Students"
    },
    question1: {
      business: "What is one major benefit of AI for SMEs?",
      students: "What is AI most useful for?"
    },
    q1Options: {
      business: [
        "It can save time and improve productivity",
        "It removes the need for customers",
        "It stops people from using phones"
      ],
      students: [
        "Helping with research, writing and productivity",
        "Replacing every teacher automatically",
        "Doing nothing except browsing"
      ]
    },
    question2: {
      business: "What is a safe way to use AI in business?",
      students: "What is a responsible way to use AI for school or job prep?"
    },
    q2Options: {
      business: [
        "Use it for drafts and ideas without sharing sensitive private data",
        "Paste customer bank details into every tool",
        "Trust every answer without checking"
      ],
      students: [
        "Use it to improve drafts, then verify and rewrite in your own voice",
        "Copy everything directly and submit it blindly",
        "Never check whether the answer is true"
      ]
    },
    submitQuiz: "Submit",
    quizResult: (score) => `You scored ${score}/2. Thanks for completing the quiz!`,
    goTutor: "Go to Tutor",
    chatPlaceholder: "Type your question…",
    send: "Send",
    tutorIntro:
      "Welcome. This is a basic AI tutor for practical AI literacy in Nigeria. Ask about business, jobs, study, prompts, or safe AI use.",
    chatStatusSecure:
      "Your details will be submitted securely."
  },

  pcm: {
    languageLabel: "Language:",
    tagline: "Better AI skill for work, business and school for Naija",
    selectTrack: "Choose your learning track",
    businessTrack: "AI for Business Owners",
    studentTrack: "AI for Students & Job Seekers",
    lessonTitle: {
      business: "Wetin be AI and how e fit help small business for Nigeria?",
      students: "Wetin be AI and why e matter for students and people wey dey find work?"
    },
    lessonBody: {
      business:
        "AI be technology wey fit help person work faster and smarter. For small business for Nigeria, e fit help with WhatsApp customer reply, marketing idea, product description, simple proposal and everyday work. But no put private customer information or bank details inside AI tool.",
      students:
        "AI be technology wey fit help you learn faster, do research better, arrange ideas, improve your writing and prepare for school or work. For students and job seekers, e fit help with CV, interview practice and research summary. But you still need verify facts and avoid copy-copy."
    },
    lessonNext: "Next",
    quizTitle: {
      business: "Quiz: AI for Business",
      students: "Quiz: AI for Students"
    },
    question1: {
      business: "Which major benefit AI get for SMEs?",
      students: "Wetin AI fit help pass for?"
    },
    q1Options: {
      business: [
        "E fit save time and improve productivity",
        "E remove need for customers",
        "E stop people from using phone"
      ],
      students: [
        "To help with research, writing and productivity",
        "To replace every teacher sharp sharp",
        "To do nothing except browse"
      ]
    },
    question2: {
      business: "Which one be safe way to use AI for business?",
      students: "Which one be responsible way to use AI for school or job prep?"
    },
    q2Options: {
      business: [
        "Use am for draft and ideas without sharing private data",
        "Paste customer bank details inside every tool",
        "Believe every answer without checking"
      ],
      students: [
        "Use am improve your draft, then verify and rewrite am for your own voice",
        "Copy everything direct submit am",
        "No bother check if the answer na true"
      ]
    },
    submitQuiz: "Submit",
    quizResult: (score) => `You score ${score}/2. Nice one for finishing the quiz!`,
    goTutor: "Go to Tutor",
    chatPlaceholder: "Type your question…",
    send: "Send",
    tutorIntro:
      "Welcome. This na basic AI tutor for practical AI literacy for Naija. Ask about business, jobs, study, prompts, or safe AI use.",
    chatStatusSecure:
      "Your details go submit securely."
  },

  yo: {
    languageLabel: "Èdè:",
    tagline: "Ọgbọn AI tó wúlò fún iṣẹ́, iṣowo àti ilé-ẹ̀kọ́ ní Nàìjíríà",
    selectTrack: "Yan ọ̀nà ẹ̀kọ́ rẹ",
    businessTrack: "AI fún Àwọn Oníwun Iṣòwò",
    studentTrack: "AI fún Àwọn Akẹ́kọ̀ọ́ àti Awon Olùwá Iṣẹ́",
    lessonTitle: {
      business: "Kí ni AI, báwo ló sì ṣe lè ran iṣowo kékeré lọ́wọ́ ní Nàìjíríà?",
      students: "Kí ni AI, kí ló sì dé tó fi ṣe pàtàkì fún akẹ́kọ̀ọ́ àti olùwá iṣẹ́?"
    },
    lessonBody: {
      business:
        "AI jẹ́ imọ̀-ẹ̀rọ tó ń jẹ́ kí iṣẹ́ rọrùn kí o sì yara. Fún iṣowo kékeré ní Nàìjíríà, ó lè ràn ọ́ lọ́wọ́ pẹ̀lú ìfọ̀rọ̀wérọ̀ WhatsApp, ìpolówó, àpejuwe ọjà, àkọsílẹ̀ ìpèsè àti iṣẹ́ ojoojúmọ́. Ṣùgbọ́n má ṣe fi data aláìkọkọ́ tàbí alaye ìfowópamọ́ sínú irinṣẹ́ AI.",
      students:
        "AI jẹ́ imọ̀-ẹ̀rọ tó lè ràn ọ́ lọ́wọ́ láti kọ́ ẹ̀kọ́ yarayara, ṣe ìwádìí dáadáa, ṣètò ero, mú ìkọ̀wé dára, àti mura sílẹ̀ fún ilé-ẹ̀kọ́ tàbí iṣẹ́. Fún akẹ́kọ̀ọ́ àti olùwá iṣẹ́, ó lè ràn ọ́ lọ́wọ́ pẹ̀lú CV, ìdánilẹ́kọ̀ọ́ ìfọ̀rọ̀wánilẹ́nuwò, àti àkótán ìwádìí. Ṣùgbọ́n o gbọ́dọ̀ ṣàyẹ̀wò òtítọ́ kí o sì yàgò fún jíjẹ́kọ ẹ̀dá mìíràn."
    },
    lessonNext: "Tẹ̀síwájú",
    quizTitle: {
      business: "Ìdánwò: AI fún Iṣòwò",
      students: "Ìdánwò: AI fún Akẹ́kọ̀ọ́"
    },
    question1: {
      business: "Kí ni àǹfààní pàtàkì kan ti AI fún SME?",
      students: "Kí ni AI wúlò jù lọ fún?"
    },
    q1Options: {
      business: [
        "Ó lè dín àkókò kù kí ó sì mú iṣẹ́ pọ̀ síi",
        "Ó mú kí oníbàárà má ṣe ṣe pàtàkì mọ́",
        "Ó dá gbogbo ènìyàn dúró lórí lílo fóònù"
      ],
      students: [
        "Ríràn lọ́wọ́ ní ìwádìí, ìkọ̀wé àti mímú iṣẹ́ yara",
        "Rípo gbogbo olùkọ́ laifọwọyi",
        "Kò ṣe nǹkan bí kò ṣe lílo intanẹẹti"
      ]
    },
    question2: {
      business: "Kí ni ọ̀nà tó dáa láti lo AI nínú iṣowo?",
      students: "Kí ni ọ̀nà ojúṣe láti lo AI fún ilé-ẹ̀kọ́ tàbí ìmúrasílẹ̀ iṣẹ́?"
    },
    q2Options: {
      business: [
        "Lo ó fún àkọọlẹ̀ àkọ́kọ́ àti ero, má sì ṣe fi data aláìkọkọ́ hàn",
        "Fi gbogbo alaye ìfowópamọ́ oníbàárà sínú irinṣẹ́ náà",
        "Gbagbọ́ gbogbo ìdáhùn láì ṣàyẹ̀wò"
      ],
      students: [
        "Lo ó láti mú àkọọlẹ̀ dara, lẹ́yìn náà ṣàyẹ̀wò kí o sì tún un kọ ní ohùn tirẹ",
        "Da gbogbo ìdáhùn sílẹ̀ taara láì ronú",
        "Má ṣe ṣàyẹ̀wò bóyá ìdáhùn náà jẹ́ òtítọ́"
      ]
    },
    submitQuiz: "Firanṣẹ́",
    quizResult: (score) => `O ní ${score}/2. Ọpẹ́ fún ṣíṣe ìdánwò!`,
    goTutor: "Lọ sí Tutor",
    chatPlaceholder: "Tẹ ìbéèrè rẹ…",
    send: "Firanṣẹ́",
    tutorIntro:
      "Ẹ káàbọ̀. Èyí jẹ́ basic AI tutor fún ẹ̀kọ́ AI tó wúlò ní Nàìjíríà. Béèrè nípa iṣowo, iṣẹ́, ẹ̀kọ́, prompt tàbí lílo AI ní ojúṣe.",
    chatStatusSecure:
      "A ó fi ìtẹ̀wọ́gbà fi data rẹ ránṣẹ́."
  },

  ha: {
    languageLabel: "Harshe:",
    tagline: "Kwarewar AI mai amfani don aiki, kasuwanci da makaranta a Najeriya",
    selectTrack: "Zaɓi hanyar karatunka",
    businessTrack: "AI don Masu Kasuwanci",
    studentTrack: "AI don Dalibai da Masu Neman Aiki",
    lessonTitle: {
      business: "Menene AI kuma ta yaya zai taimaka wa ƙaramar kasuwanci a Najeriya?",
      students: "Menene AI kuma me ya sa yake da muhimmanci ga dalibai da masu neman aiki?"
    },
    lessonBody: {
      business:
        "AI fasaha ce da ke taimaka wa mutane su yi aiki cikin sauri da inganci. Ga ƙaramar kasuwanci a Najeriya, zai iya taimakawa da saƙonnin WhatsApp ga kwastomomi, tallace-tallace, bayanin kaya, rubuta takardun aiki da kuma yawan aiki na yau da kullum. Amma kada a saka bayanan sirri ko bayanan banki cikin kayan aikin AI.",
      students:
        "AI fasaha ce da ke taimaka maka ka yi bincike da sauri, ka tsara tunani, ka inganta rubutu, ka koyi sabbin abubuwa kuma ka shirya don makaranta ko aiki. Ga dalibai da masu neman aiki, zai taimaka wajen CV, shirye-shiryen hira da taƙaitaccen bincike. Amma dole ne a tantance gaskiya kuma a guji kwafi kai tsaye."
    },
    lessonNext: "Na gaba",
    quizTitle: {
      business: "Tambayoyi: AI don Kasuwanci",
      students: "Tambayoyi: AI don Dalibai"
    },
    question1: {
      business: "Wane babban amfani ne AI ke da shi ga SMEs?",
      students: "Me AI ya fi amfani da shi?"
    },
    q1Options: {
      business: [
        "Yana iya ceton lokaci kuma ya ƙara yawan aiki",
        "Yana cire bukatar kwastomomi gaba ɗaya",
        "Yana hana mutane amfani da waya"
      ],
      students: [
        "Taimako wajen bincike, rubutu da yawan aiki",
        "Maye gurbin kowane malami kai tsaye",
        "Ba ya yin komai sai lilo"
      ]
    },
    question2: {
      business: "Wace hanya ce mai aminci wajen amfani da AI a kasuwanci?",
      students: "Wace hanya ce mai kyau wajen amfani da AI a makaranta ko neman aiki?"
    },
    q2Options: {
      business: [
        "A yi amfani da shi don rubutun farko da ra'ayoyi ba tare da saka bayanan sirri ba",
        "A saka bayanan bankin kwastoma a duk kayan aiki",
        "A yarda da kowace amsa ba tare da dubawa ba"
      ],
      students: [
        "A yi amfani da shi don gyara rubutu sannan a duba gaskiya a sake rubutawa da harshenka",
        "A kwafa komai kai tsaye a miƙa",
        "Kada a taɓa bincika ko amsar gaskiya ce"
      ]
    },
    submitQuiz: "Aika",
    quizResult: (score) => `Ka samu ${score}/2. Na gode da kammala tambayoyin!`,
    goTutor: "Je zuwa Tutor",
    chatPlaceholder: "Rubuta tambayarka…",
    send: "Aika",
    tutorIntro:
      "Barka da zuwa. Wannan basic AI tutor ne don koyon AI mai amfani a Najeriya. Yi tambaya game da kasuwanci, aiki, karatu, prompt ko amfani da AI cikin alhaki.",
    chatStatusSecure:
      "Za a aika bayananka cikin tsaro."
  },

  ig: {
    languageLabel: "Asụsụ:",
    tagline: "Nkà AI bara uru maka ọrụ, azụmahịa na ụlọ akwụkwọ na Naịjịrịa",
    selectTrack: "Họrọ ụzọ mmụta gị",
    businessTrack: "AI maka Ndị Nwe Azụmahịa",
    studentTrack: "AI maka Ụmụakwụkwọ na Ndị Na-achọ Ọrụ",
    lessonTitle: {
      business: "Gịnị bụ AI, olee otú ọ ga-esi nyere obere azụmahịa aka na Naịjịrịa?",
      students: "Gịnị bụ AI, gịnị mere o ji dị mkpa nye ụmụakwụkwọ na ndị na-achọ ọrụ?"
    },
    lessonBody: {
      business:
        "AI bụ teknụzụ na-enyere mmadụ aka ịrụ ọrụ ngwa ngwa na nke ọma. Maka obere azụmahịa na Naịjịrịa, ọ nwere ike inyere gị aka na azịza WhatsApp nye ndị ahịa, echiche mgbasa ozi, nkọwa ngwaahịa, akwụkwọ ọrụ dị mfe na imepụta ọrụ kwa ụbọchị. Ma etinyela ozi nzuzo ma ọ bụ ozi akụ na ụba ndị ahịa n’ime ngwaọrụ AI.",
      students:
        "AI bụ teknụzụ nwere ike inyere gị aka ịmụ ngwa ngwa, mee nchọpụta nke ọma, hazie echiche, meziwanye ide ihe ma kwadebe maka ụlọ akwụkwọ na ọrụ. Maka ụmụakwụkwọ na ndị na-achọ ọrụ, ọ nwere ike inyere aka na CV, omume ajụjụ ọnụ na nchịkọta nchọpụta. Ma ị ga-enyocha eziokwu ma zere ịkpọrọ ihe niile ozugbo."
    },
    lessonNext: "Gaa n’ihu",
    quizTitle: {
      business: "Ajụjụ: AI maka Azụmahịa",
      students: "Ajụjụ: AI maka Ụmụakwụkwọ"
    },
    question1: {
      business: "Kedu otu uru AI nwere maka SMEs?",
      students: "Kedu ihe AI kacha baa uru maka ya?"
    },
    q1Options: {
      business: [
        "Ọ nwere ike ịchekwa oge ma melite arụmọrụ",
        "Ọ na-ewepụ mkpa ndị ahịa",
        "Ọ na-egbochi mmadụ iji ekwentị"
      ],
      students: [
        "Inyere nchọpụta, ide ihe na arụmọrụ aka",
        "Dochie ndị nkuzi niile ozugbo",
        "Ọ dịghị eme ihe ọ bụla ma e wezụga ịgagharị"
      ]
    },
    question2: {
      business: "Kedu ụzọ nchekwa dị mma iji AI na azụmahịa?",
      students: "Kedu ụzọ ezi uche dị na ya iji AI na ọmụmụ ma ọ bụ nchọ ọrụ?"
    },
    q2Options: {
      business: [
        "Jiri ya mee echiche na draịftụ mbụ na-enweghị itinye data nzuzo",
        "Tinye nkọwa akụ ndị ahịa n’ime ngwaọrụ niile",
        "Kweta azịza niile n’enweghị nyocha"
      ],
      students: [
        "Jiri ya meziwanye draịftụ, mesịa nyochaa eziokwu ma dee ya n’olu gị",
        "Depụtaghachi ihe niile ozugbo zipụ ya",
        "Efula ilele ma azịza ahụ bụ eziokwu"
      ]
    },
    submitQuiz: "Zipu",
    quizResult: (score) => `Ị nwetara ${score}/2. Daalụ maka imecha ajụjụ a!`,
    goTutor: "Gaa na Tutor",
    chatPlaceholder: "Tinye ajụjụ gị…",
    send: "Zipu",
    tutorIntro:
      "Nnọọ. Nke a bụ basic AI tutor maka mmụta AI bara uru na Naịjịrịa. Jụọ maka azụmahịa, ọrụ, ọmụmụ, prompt ma ọ bụ iji AI n'ụzọ ziri ezi.",
    chatStatusSecure:
      "A ga-eziga nkọwa gị n’ụzọ nchekwa."
  }
};

function getLanguage() {
  return localStorage.getItem("naija_ai_lang") || "en";
}

function getTrack() {
  return localStorage.getItem("naija_ai_track") || "business";
}

function getDict() {
  return translations[getLanguage()] || translations.en;
}

function renderLanguageSelectors() {
  const selected = getLanguage();
  document.querySelectorAll("#language").forEach((select) => {
    const currentValue = select.value || selected;
    select.innerHTML = "";
    languageOptions.forEach((lang) => {
      const option = document.createElement("option");
      option.value = lang.code;
      option.textContent = lang.label;
      if (lang.code === currentValue) option.selected = true;
      select.appendChild(option);
    });
    select.value = selected;
  });
}

function updateLanguageLabels() {
  const dict = getDict();
  document.querySelectorAll('label[for="language"]').forEach((label) => {
    label.textContent = dict.languageLabel;
  });
}

function setLanguage(lang) {
  localStorage.setItem("naija_ai_lang", lang);
  window.location.reload();
}

function startTrack(track) {
  localStorage.setItem("naija_ai_track", track);
  localStorage.removeItem("naija_ai_score");
  window.location.href = "lesson.html?v=14";
}

function updateText() {
  const dict = getDict();

  renderLanguageSelectors();
  updateLanguageLabels();

  const taglineEl = document.getElementById("tagline");
  if (taglineEl) taglineEl.textContent = dict.tagline;

  const selectTrackEl = document.querySelector(".tracks h2");
  if (selectTrackEl) selectTrackEl.textContent = dict.selectTrack;

  const buttons = document.querySelectorAll(".tracks button");
  if (buttons.length >= 2) {
    buttons[0].textContent = dict.businessTrack;
    buttons[1].textContent = dict.studentTrack;
  }

  const statusEl = document.getElementById("cta-status");
  if (statusEl && !new URLSearchParams(window.location.search).get("submitted")) {
    statusEl.textContent = dict.chatStatusSecure || "Your details will be submitted securely.";
  }
}

function loadLesson() {
  const track = getTrack();
  const dict = getDict();

  renderLanguageSelectors();
  updateLanguageLabels();

  const titleEl = document.getElementById("lesson-title");
  const bodyEl = document.getElementById("lesson-body");
  const nextBtn = document.getElementById("next-button");

  if (titleEl) titleEl.textContent = dict.lessonTitle[track];
  if (bodyEl) bodyEl.textContent = dict.lessonBody[track];
  if (nextBtn) nextBtn.textContent = dict.lessonNext;
}

function loadQuiz() {
  const track = getTrack();
  const dict = getDict();

  renderLanguageSelectors();
  updateLanguageLabels();

  const quizTitle = document.getElementById("quiz-title");
  if (quizTitle) quizTitle.textContent = dict.quizTitle[track];

  const q1Text = document.getElementById("q1-text");
  if (q1Text) q1Text.textContent = dict.question1[track];

  const q1Options = document.getElementsByName("q1");
  dict.q1Options[track].forEach((text, index) => {
    if (q1Options[index] && q1Options[index].nextElementSibling) {
      q1Options[index].nextElementSibling.textContent = text;
    }
  });

  const q2Text = document.getElementById("q2-text");
  if (q2Text) q2Text.textContent = dict.question2[track];

  const q2Options = document.getElementsByName("q2");
  dict.q2Options[track].forEach((text, index) => {
    if (q2Options[index] && q2Options[index].nextElementSibling) {
      q2Options[index].nextElementSibling.textContent = text;
    }
  });

  const submitBtn = document.getElementById("submit-button");
  if (submitBtn) submitBtn.textContent = dict.submitQuiz;

  const tutorBtn = document.getElementById("tutor-button");
  if (tutorBtn) tutorBtn.textContent = dict.goTutor;
}

function submitQuiz() {
  const track = getTrack();
  const dict = getDict();

  const correct = {
    business: [0, 0],
    students: [0, 0]
  };

  let score = 0;
  const q1Answer = document.querySelector('input[name="q1"]:checked');
  const q2Answer = document.querySelector('input[name="q2"]:checked');

  if (q1Answer && parseInt(q1Answer.value, 10) === correct[track][0]) score += 1;
  if (q2Answer && parseInt(q2Answer.value, 10) === correct[track][1]) score += 1;

  localStorage.setItem("naija_ai_score", String(score));

  const resultEl = document.getElementById("result");
  if (resultEl) resultEl.textContent = dict.quizResult(score);

  const afterQuiz = document.getElementById("after-quiz");
  if (afterQuiz) afterQuiz.style.display = "block";

  const tutorBtn = document.getElementById("tutor-button");
  if (tutorBtn) tutorBtn.textContent = dict.goTutor;
}

function addMessage(sender, text) {
  const messagesEl = document.getElementById("messages");
  if (!messagesEl) return;

  const msgDiv = document.createElement("div");
  msgDiv.classList.add("message", sender);
  msgDiv.textContent = text;
  messagesEl.appendChild(msgDiv);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function fillTutorPrompt(text) {
  const inputEl = document.getElementById("chat-input");
  if (!inputEl) return;
  inputEl.value = text;
  inputEl.focus();
}

function setCTAStatus(message, good = true) {
  const statusEl = document.getElementById("cta-status");
  if (!statusEl) return;
  statusEl.textContent = message;
  statusEl.style.color = good ? "white" : "#ffd7d7";
}

function handleSubmittedState() {
  const params = new URLSearchParams(window.location.search);
  const submitted = params.get("submitted");
  if (submitted !== "1") return;

  const statusEl = document.getElementById("cta-status");
  if (statusEl) {
    statusEl.textContent = "Thanks — your pilot interest has been received. We’ll contact you soon.";
    statusEl.style.color = "white";
    statusEl.style.fontWeight = "700";
  }

  const banner = document.getElementById("submitted-banner");
  if (banner) {
    banner.style.display = "block";
  }

  const nameEl = document.getElementById("cta-name");
  const emailEl = document.getElementById("cta-email");
  if (nameEl) nameEl.value = "";
  if (emailEl) emailEl.value = "";

  if (window.history && window.history.replaceState) {
    const cleanUrl = window.location.origin + window.location.pathname;
    window.history.replaceState({}, document.title, cleanUrl);
  }
}

const tutorBrain = {
  en: {
    hello:
      "Welcome. I can help with AI basics, business replies, CV improvement, interviews, study support, prompts, and safe AI use. Ask me one real task you want help with.",
    what_is_ai:
      "AI is a computer tool that helps with tasks like writing, summarising, organising information, and drafting ideas. It is useful, but it can still be wrong, so important facts should be checked.",
    business_whatsapp_reply:
      "A strong customer reply should be short and clear: availability, price, delivery, and next step. Try: “Write a short WhatsApp reply for a customer asking about [product]. Include price, delivery area, and how to order.”",
    price_enquiry_reply:
      "A good price reply should mention the item, price, options, and how the customer can proceed. Keep it simple and avoid hidden surprises.",
    customer_complaint:
      "For complaints, follow this structure: acknowledge the issue, apologise where needed, explain the next step, and stay calm. Do not argue with the customer.",
    product_description:
      "A product description should explain what the product is, who it is for, and why it is useful. Focus on clear benefits, not hype.",
    marketing_caption:
      "A strong caption uses a hook, one benefit, and a call to action. Prompt: “Write 3 Instagram captions for [product/service]. Keep them short, catchy, and natural for a Nigerian audience.”",
    finance_readiness:
      "Before looking for funding, organise a one-page business summary, sales records, expense records, and a use-of-funds note. Do not invent numbers.",
    cv_help:
      "For CV improvement, use action verbs, clear tasks, and honest evidence. Prompt: “Rewrite these CV bullets for a [role]. Make them clear, achievement-focused, and honest.”",
    interview_practice:
      "For interviews, use AI as a coach. Prompt: “Act as an interviewer for a [role]. Ask me 5 realistic questions and then improve my answers using STAR.”",
    star_method:
      "STAR means Situation, Task, Action, Result. It helps you answer interview questions clearly using real examples.",
    student_help:
      "For studying, AI is best used to explain topics, create study plans, summarise notes, and generate quiz questions. Use it to learn, not to cheat.",
    study_plan:
      "A good study plan matches your real time and weak topics. Prompt: “Create a 7-day study plan for [subject] with [hours] per day.”",
    summarise_notes:
      "AI can summarise notes into key points and terms, but you should compare the summary with the original notes to make sure nothing important was lost.",
    research_outline:
      "For research, AI should help structure your work, not invent sources. Prompt: “Build a research outline on [topic] with headings, subheadings, and what evidence to look for.”",
    lesson_plan:
      "For teachers, a lesson plan should include objective, starter, activity, check for understanding, and homework. AI can draft it, but teacher judgment comes first.",
    memo:
      "A memo should include subject, purpose, context, requested action, and deadline. Keep it clear and professional.",
    safety:
      "Do not paste passwords, PINs, OTPs, BVN, NIN, private customer lists, student records, payroll files, or confidential work documents into AI tools. Use placeholders instead.",
    hallucination:
      "Hallucination means AI gives an answer that sounds confident but is wrong or made up. Always verify important facts, names, dates, and citations.",
    prompting:
      "A strong prompt includes role, task, context, format, and tone. Example: “Act as a customer-service assistant. Write a short WhatsApp reply for a Nigerian business selling [product].”",
    unknown:
      "I can help with AI basics, business replies, CVs, interviews, study support, prompts, and safe AI use. Try asking one clear task."
  },
  pcm: {
    hello:
      "Welcome. I fit help with AI basics, business reply, CV improvement, interview practice, study support, prompts, and safe AI use. Ask me one real task.",
    what_is_ai:
      "AI na computer tool wey fit help you write, summarise, arrange ideas and draft things faster. But e still fit wrong, so you need check important facts.",
    business_whatsapp_reply:
      "Better customer reply suppose get availability, price, delivery, and next step. Try: “Write short WhatsApp reply for customer wey ask about [product]. Add price, delivery and how to order.”",
    price_enquiry_reply:
      "Price reply should mention the item, amount, option, and next step. Keep am clear and simple.",
    customer_complaint:
      "If customer complain, acknowledge, apologise if needed, explain next step, and stay calm. No argue.",
    product_description:
      "Product description suppose talk wetin the product be, who e help, and why e useful.",
    marketing_caption:
      "Good caption get hook, one benefit, and CTA. Prompt: “Write 3 Instagram captions for [product/service]. Make am short and natural for Naija audience.”",
    finance_readiness:
      "Before funding, arrange business summary, sales record, expense record, and use-of-funds note. No invent numbers.",
    cv_help:
      "For CV, use action words, clear work, and honest evidence. Prompt: “Rewrite these CV bullets for [role]. Make am clear and honest.”",
    interview_practice:
      "Use AI like interview coach. Prompt: “Act as interviewer for [role]. Ask me 5 questions and improve my answers.”",
    student_help:
      "For school, AI fit explain topic, make study plan, summarise notes and create quiz. Use am learn, no use am cheat.",
    safety:
      "No paste password, PIN, OTP, BVN, NIN, customer private info, student records or confidential documents inside AI tools.",
    prompting:
      "Good prompt get role, task, context, format and tone.",
    unknown:
      "I fit help with AI basics, business replies, CV, interview, study, prompts and safe AI use."
  }
};

function detectIntent(message) {
  const m = message.toLowerCase();

  if (m.includes("password") || m.includes("pin") || m.includes("otp") || m.includes("bvn") || m.includes("nin") || m.includes("card") || m.includes("confidential")) return "safety";
  if (m.includes("hallucination") || m.includes("made up") || m.includes("fake source")) return "hallucination";
  if (m.includes("prompt")) return "prompting";
  if ((m.includes("what") && m.includes("ai")) || m.includes("wetin be ai") || m.includes("kini ai") || m.includes("menene ai")) return "what_is_ai";
  if (m.includes("hello") || m.includes("hi") || m.includes("how far") || m.includes("sannu") || m.includes("ndewo") || m.includes("bawo")) return "hello";

  if (m.includes("whatsapp") || m.includes("reply customer") || m.includes("customer reply")) return "business_whatsapp_reply";
  if (m.includes("price") && (m.includes("reply") || m.includes("customer"))) return "price_enquiry_reply";
  if (m.includes("complaint") || m.includes("angry customer")) return "customer_complaint";
  if (m.includes("product description")) return "product_description";
  if (m.includes("caption") || m.includes("marketing")) return "marketing_caption";
  if (m.includes("funding") || m.includes("loan") || m.includes("lender") || m.includes("finance readiness")) return "finance_readiness";

  if (m.includes("cv") || m.includes("resume")) return "cv_help";
  if (m.includes("interview")) return "interview_practice";
  if (m.includes("star")) return "star_method";

  if (m.includes("study plan")) return "study_plan";
  if (m.includes("summarise") || m.includes("summarize") || m.includes("notes")) return "summarise_notes";
  if (m.includes("research")) return "research_outline";
  if (m.includes("lesson plan") || m.includes("teacher")) return "lesson_plan";
  if (m.includes("student") || m.includes("exam") || m.includes("assignment") || m.includes("school")) return "student_help";

  if (m.includes("memo") || m.includes("minutes") || m.includes("meeting")) return "memo";

  return "unknown";
}

function getCoachResponse(message) {
  const lang = getLanguage();
  const bank = tutorBrain[lang] || tutorBrain.en;
  const intent = detectIntent(message);
  return bank[intent] || tutorBrain.en[intent] || bank.unknown || tutorBrain.en.unknown;
}

function initTutor() {
  const dict = getDict();

  renderLanguageSelectors();
  updateLanguageLabels();

  const inputEl = document.getElementById("chat-input");
  if (inputEl) inputEl.placeholder = dict.chatPlaceholder;

  const sendBtn = document.querySelector(".chat-input button");
  if (sendBtn) sendBtn.textContent = dict.send;

  const messagesEl = document.getElementById("messages");
  if (messagesEl && messagesEl.childElementCount === 0) {
    addMessage("bot", dict.tutorIntro);
  }
}

function sendChat() {
  const inputEl = document.getElementById("chat-input");
  if (!inputEl) return;

  const text = inputEl.value.trim();
  if (!text) return;

  addMessage("user", text);
  inputEl.value = "";

  setTimeout(() => {
    addMessage("bot", getCoachResponse(text));
  }, 250);
}

document.addEventListener("DOMContentLoaded", () => {
  renderLanguageSelectors();
  updateLanguageLabels();
  updateText();
  handleSubmittedState();
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("service-worker.js")
      .catch((err) => console.log("Service Worker registration failed", err));
  });
}
