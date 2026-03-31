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
      "Welcome. This is a demo AI tutor for practical AI literacy in Nigeria. In the full version, this will connect to a real AI model and give safer, richer guidance.",
    chatWhatIsAi:
      "AI stands for Artificial Intelligence. It refers to systems that can help with tasks like writing, summarising, organising information, spotting patterns, and supporting decisions.",
    chatHello: "Hello. What would you like help with today?",
    chatFallback:
      "This is a demo tutor. In the full version, I will answer with deeper support for business, jobs, study, and responsible AI use."
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
      "Ẹ káàbọ̀. Èyí jẹ́ àfihàn tutor AI fún ẹ̀kọ́ AI tó wúlò ní Nàìjíríà. Ní ẹ̀dà gidi, a ó so ó mọ́ awoṣe AI gidi.",
    chatWhatIsAi:
      "AI túmọ̀ sí Artificial Intelligence. Ó jẹ́ àwọn eto tó lè ràn ọ́ lọ́wọ́ pẹ̀lú ìkọ̀wé, àkótán, títò alaye, mímọ́ àpẹẹrẹ àti ìrànlọ́wọ́ nínú ìpinnu.",
    chatHello: "Pẹ̀lẹ́ o. Kí ni o fẹ́ kí n ràn ẹ́ lọ́wọ́ pẹlu lónìí?",
    chatFallback:
      "Èyí jẹ́ tutor àfihàn. Ní ẹ̀dà pipe, màá fún ọ ní ìrànlọ́wọ́ jinlẹ̀ síi fún iṣowo, iṣẹ́, ẹ̀kọ́ àti lílo AI ní ojúṣe."
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
      "Barka da zuwa. Wannan gwajin tutor AI ne don koyon AI mai amfani a Najeriya. A cikakken sigar, za a haɗa shi da ainihin samfurin AI.",
    chatWhatIsAi:
      "AI na nufin Artificial Intelligence. Tsari ne da zai iya taimakawa wajen rubutu, taƙaitawa, tsara bayanai, gano alamu da taimakon yanke shawara.",
    chatHello: "Sannu. Me kake so in taimaka maka da shi yau?",
    chatFallback:
      "Wannan tutor na gwaji ne. A cikakken sigar, zan ba ka taimako mai zurfi don kasuwanci, aiki, karatu da amfani da AI cikin alhaki."
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
      "Nnọọ. Nke a bụ tutor AI ngosi maka mmụta AI bara uru na Naịjịrịa. Na ụdị zuru oke, a ga-ejikọta ya na ezigbo ụdị AI.",
    chatWhatIsAi:
      "AI pụtara Artificial Intelligence. Ọ bụ usoro nwere ike inyere aka n’ide ihe, nchịkọta, ịhazi ozi, ịchọpụta usoro na inyere mkpebi aka.",
    chatHello: "Ndeewo. Gịnị ka ịchọrọ ka m nyere gị aka taa?",
    chatFallback:
      "Nke a bụ tutor ngosi. Na ụdị zuru oke, aga m enye nkwado miri emi maka azụmahịa, ọrụ, ọmụmụ na iji AI n'ụzọ ziri ezi."
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
        "AI be technology wey fit help you learn faster, do research better, arrange ideas, improve your writing and prepare for school or work. For students and job seekers, e fit help with CV, interview practice and research summary. But you still need verify facts and avoid copy-copy.",
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
      "Welcome. This one na demo AI tutor for practical AI literacy for Naija. For full version, e go connect to real AI model.",
    chatWhatIsAi:
      "AI mean Artificial Intelligence. Na system wey fit help with writing, summary, organising information, finding pattern and support decision making.",
    chatHello: "How far. Wetin you want make I help you with today?",
    chatFallback:
      "This one na demo tutor. For full version, I go give deeper help for business, job, study and responsible AI use."
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
  window.location.href = "lesson.html?v=3";
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

  const dict = getDict();
  addMessage("user", text);
  inputEl.value = "";

  setTimeout(() => {
    const lower = text.toLowerCase();
    let response = dict.chatFallback;

    if ((lower.includes("what") && lower.includes("ai")) || lower.includes("wetin be ai") || lower.includes("menene ai") || lower.includes("kini ai")) {
      response = dict.chatWhatIsAi;
    } else if (lower.includes("hello") || lower.includes("hi") || lower.includes("sannu") || lower.includes("ndewo") || lower.includes("bawo")) {
      response = dict.chatHello;
    }

    addMessage("bot", response);
  }, 400);
}

document.addEventListener("DOMContentLoaded", () => {
  renderLanguageSelectors();
  updateLanguageLabels();
  updateText();
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("service-worker.js")
      .catch((err) => console.log("Service Worker registration failed", err));
  });
}

function fillTutorPrompt(text) {
  const inputEl = document.getElementById("chat-input");
  if (!inputEl) return;
  inputEl.value = text;
  inputEl.focus();
}
