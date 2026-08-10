(function () {
  "use strict";

  var STORAGE_KEYS = {
    language: "myhub-language",
    theme: "myhub-theme",
    view: "myhub-view-mode"
  };

  var UI = {
    ko: {
      about: "소개",
      education: "학력",
      experience: "경력",
      projects: "프로젝트",
      publications: "논문 · 지식재산",
      awards: "수상",
      skills: "스킬",
      profile: "프로필",
      contact: "연락처",
      affiliation: "현재 소속",
      social: "링크",
      present: "현재",
      grade: "평점",
      role: "역할",
      expand: "크게 보기",
      itemCount: "개 항목",
      print: "이력서 인쇄",
      themeDark: "다크 모드 켜기",
      themeLight: "라이트 모드 켜기",
      viewMetaverse: "3D 메타버스 모드 켜기",
      viewClassic: "기본 CV 모드로 돌아가기",
      language: "Switch to English",
      menuOpen: "메뉴 열기",
      menuClose: "메뉴 닫기",
      closeImage: "이미지 닫기",
      loadError: "CV 데이터를 불러오지 못했습니다. 로컬 서버로 실행했는지 확인해 주세요.",
      researchFocus: "Research focus",
      current: "Current"
    },
    en: {
      about: "About",
      education: "Education",
      experience: "Experience",
      projects: "Projects",
      publications: "Publications & IP",
      awards: "Awards",
      skills: "Skills",
      profile: "Profile",
      contact: "Contact",
      affiliation: "Affiliation",
      social: "Links",
      present: "Present",
      grade: "GPA",
      role: "Role",
      expand: "View image",
      itemCount: "items",
      print: "Print CV",
      themeDark: "Enable dark mode",
      themeLight: "Enable light mode",
      viewMetaverse: "Enable 3D metaverse mode",
      viewClassic: "Return to classic CV mode",
      language: "한국어로 전환",
      menuOpen: "Open menu",
      menuClose: "Close menu",
      closeImage: "Close image",
      loadError: "Unable to load the CV data. Make sure the site is running from a local server.",
      researchFocus: "Research focus",
      current: "Current"
    }
  };

  var state = {
    data: null,
    language: readPreference(STORAGE_KEYS.language) === "en" ? "en" : "ko",
    theme: readPreference(STORAGE_KEYS.theme) === "dark" ? "dark" : "light",
    view: readPreference(STORAGE_KEYS.view) === "metaverse" ? "metaverse" : "classic",
    observer: null
  };

  var elements = {
    root: document.documentElement,
    body: document.body,
    profile: document.getElementById("profile-panel"),
    content: document.getElementById("content-panel"),
    nav: document.getElementById("navigation-links"),
    headerName: document.getElementById("header-name"),
    menuButton: document.getElementById("menu-button"),
    printButton: document.getElementById("print-button"),
    viewButton: document.getElementById("view-button"),
    themeButton: document.getElementById("theme-button"),
    languageButton: document.getElementById("language-button"),
    dialog: document.getElementById("media-dialog"),
    dialogClose: document.getElementById("dialog-close"),
    dialogImage: document.getElementById("media-image"),
    dialogCaption: document.getElementById("media-caption")
  };

  function readPreference(key) {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      return null;
    }
  }

  function savePreference(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      return;
    }
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function localize(value) {
    if (value == null) {
      return "";
    }
    if (typeof value === "object" && !Array.isArray(value)) {
      return value[state.language] || value.ko || value.en || "";
    }
    return String(value);
  }

  function hasItems(value) {
    return Array.isArray(value) && value.length > 0;
  }

  function isPresent(value) {
    if (value == null) {
      return false;
    }
    if (Array.isArray(value)) {
      return value.length > 0;
    }
    return localize(value).trim().length > 0;
  }

  function formatPeriod(item) {
    if (item.period) {
      return escapeHtml(localize(item.period));
    }
    var start = item.start || "";
    var end = item.end === "present" ? UI[state.language].present : item.end || "";
    return escapeHtml(start && end ? start + " — " + end : start || end);
  }

  function sectionHeading(id, title, count) {
    var countMarkup = count
      ? '<span class="section-count">' + escapeHtml(count) + " " + UI[state.language].itemCount + "</span>"
      : "";
    return (
      '<div class="section-heading-row">' +
        '<h2 class="section-title" id="' + id + '-title">' + escapeHtml(title) + "</h2>" +
        countMarkup +
      "</div>"
    );
  }

  function renderDetails(details) {
    if (!hasItems(details)) {
      return "";
    }
    return (
      '<dl class="profile-detail-list">' +
      details
        .filter(function (item) {
          return isPresent(item.value);
        })
        .map(function (item) {
          var value = escapeHtml(localize(item.value));
          if (item.href) {
            value = '<a href="' + escapeHtml(item.href) + '">' + value + "</a>";
          }
          return (
            '<div class="profile-detail">' +
              "<dt>" + escapeHtml(localize(item.label)) + "</dt>" +
              "<dd>" + value + "</dd>" +
            "</div>"
          );
        })
        .join("") +
      "</dl>"
    );
  }

  function renderProfileGroup(title, content) {
    if (!content) {
      return "";
    }
    return (
      '<section class="profile-group">' +
        '<h3 class="profile-group-title">' + escapeHtml(title) + "</h3>" +
        content +
      "</section>"
    );
  }

  function renderProfile() {
    var profile = state.data.profile;
    var primaryName = state.language === "ko" ? profile.name.ko : profile.name.en;
    var secondaryName = state.language === "ko" ? profile.name.en : profile.name.ko;
    var badges = hasItems(profile.roles)
      ? '<div class="badge-list">' +
          profile.roles.map(function (role) {
            return '<span class="badge">' + escapeHtml(localize(role)) + "</span>";
          }).join("") +
        "</div>"
      : "";

    var affiliation = isPresent(profile.affiliation && profile.affiliation.organization)
      ? '<div class="affiliation-box">' +
          "<strong>" + escapeHtml(localize(profile.affiliation.organization)) + "</strong>" +
          "<span>" + escapeHtml(localize(profile.affiliation.position)) + "</span>" +
        "</div>"
      : "";

    var socials = hasItems(profile.socials)
      ? '<div class="social-links">' +
          profile.socials.map(function (social) {
            return (
              '<a class="social-link" href="' + escapeHtml(social.url) +
              '" target="_blank" rel="noreferrer noopener">' +
              escapeHtml(localize(social.label)) +
              "</a>"
            );
          }).join("") +
        "</div>"
      : "";

    elements.profile.setAttribute("aria-label", UI[state.language].profile);
    elements.profile.innerHTML =
      '<div class="profile-card">' +
        '<div class="profile-card-top">' +
          '<div class="profile-photo-frame">' +
            '<img class="profile-photo" src="' + escapeHtml(profile.photo) +
            '" alt="' + escapeHtml(primaryName) + '" width="232" height="288" />' +
          "</div>" +
          '<div class="profile-heading">' +
            '<h1 class="profile-name">' + escapeHtml(primaryName) +
              '<span class="profile-romanized-name">' + escapeHtml(secondaryName) + "</span>" +
            "</h1>" +
            '<p class="profile-headline">' + escapeHtml(localize(profile.headline)) + "</p>" +
            badges +
          "</div>" +
        "</div>" +
        '<div class="profile-groups-grid">' +
          renderProfileGroup(UI[state.language].profile, renderDetails(profile.details)) +
          renderProfileGroup(UI[state.language].contact, renderDetails(profile.contacts)) +
          renderProfileGroup(UI[state.language].affiliation, affiliation) +
          renderProfileGroup(UI[state.language].social, socials) +
        "</div>" +
      "</div>";
  }

  function renderIntro() {
    var profile = state.data.profile;
    if (!isPresent(profile.about)) {
      return "";
    }
    var meta = [];
    if (profile.affiliation && isPresent(profile.affiliation.organization)) {
      meta.push(escapeHtml(localize(profile.affiliation.organization)));
    }
    if (hasItems(profile.focusAreas)) {
      meta.push(escapeHtml(profile.focusAreas.map(localize).join(" · ")));
    }
    return (
      '<section class="intro-card" id="about" aria-labelledby="about-title">' +
        '<span class="eyebrow">' + UI[state.language].researchFocus + "</span>" +
        '<h2 class="intro-title" id="about-title">' + escapeHtml(localize(profile.introTitle)) + "</h2>" +
        '<p class="intro-copy">' + escapeHtml(localize(profile.about)) + "</p>" +
        (meta.length
          ? '<div class="intro-meta">' + meta.map(function (item) {
              return "<span>" + item + "</span>";
            }).join("") + "</div>"
          : "") +
      "</section>"
    );
  }

  function renderEducation() {
    var items = state.data.education;
    if (!hasItems(items)) {
      return "";
    }
    return (
      '<section class="content-section" id="education" aria-labelledby="education-title">' +
        sectionHeading("education", UI[state.language].education, items.length) +
        '<div class="timeline-list">' +
          items.map(function (item) {
            return (
              '<article class="timeline-item">' +
                '<div class="timeline-date">' + formatPeriod(item) + "</div>" +
                '<div class="timeline-content">' +
                  "<h3>" + escapeHtml(localize(item.degree)) + " · " + escapeHtml(localize(item.school)) + "</h3>" +
                  '<p class="timeline-subtitle">' + escapeHtml(localize(item.department)) + "</p>" +
                  (isPresent(item.description)
                    ? '<p class="timeline-description">' + escapeHtml(localize(item.description)) + "</p>"
                    : "") +
                  (item.grade
                    ? '<div class="timeline-meta"><span>' + UI[state.language].grade + " " +
                      escapeHtml(item.grade) + "</span></div>"
                    : "") +
                "</div>" +
              "</article>"
            );
          }).join("") +
        "</div>" +
      "</section>"
    );
  }

  function renderExperience() {
    var items = state.data.experience;
    if (!hasItems(items)) {
      return "";
    }
    return (
      '<section class="content-section" id="experience" aria-labelledby="experience-title">' +
        sectionHeading("experience", UI[state.language].experience, items.length) +
        '<div class="timeline-list">' +
          items.map(function (item) {
            var subtitle = [localize(item.organization), localize(item.location)]
              .filter(Boolean)
              .join(" · ");
            return (
              '<article class="timeline-item">' +
                '<div class="timeline-date">' + formatPeriod(item) + "</div>" +
                '<div class="timeline-content">' +
                  "<h3>" + escapeHtml(localize(item.title)) + "</h3>" +
                  '<p class="timeline-subtitle">' + escapeHtml(subtitle) + "</p>" +
                  '<p class="timeline-description">' + escapeHtml(localize(item.description)) + "</p>" +
                "</div>" +
              "</article>"
            );
          }).join("") +
        "</div>" +
      "</section>"
    );
  }

  function renderProjects() {
    var items = state.data.projects;
    if (!hasItems(items)) {
      return "";
    }
    return (
      '<section class="content-section" id="projects" aria-labelledby="projects-title">' +
        sectionHeading("projects", UI[state.language].projects, items.length) +
        '<div class="project-grid">' +
          items.map(function (item) {
            var title = localize(item.title);
            var highlights = hasItems(item.highlights)
              ? '<ul class="project-highlights">' +
                  item.highlights.map(function (highlight) {
                    return "<li>" + escapeHtml(localize(highlight)) + "</li>";
                  }).join("") +
                "</ul>"
              : "";
            var tags = hasItems(item.skills)
              ? '<div class="project-tags">' +
                  item.skills.map(function (skill) {
                    return '<span class="project-tag">' + escapeHtml(skill) + "</span>";
                  }).join("") +
                "</div>"
              : "";
            var image = item.image
              ? '<button class="project-media-button" type="button" data-media="' +
                  escapeHtml(item.image) + '" data-caption="' + escapeHtml(title) +
                  '" data-expand-label="' + UI[state.language].expand +
                  '" aria-label="' + UI[state.language].expand + ": " + escapeHtml(title) + '">' +
                  '<img class="project-image' + (item.imageFit === "contain" ? " is-contain" : "") +
                  '" src="' + escapeHtml(item.image) + '" alt="' + escapeHtml(title) +
                  '" loading="lazy" />' +
                "</button>"
              : "";
            return (
              '<article class="project-card">' +
                image +
                '<div class="project-body">' +
                  '<div class="project-kicker"><span>' + escapeHtml(localize(item.category)) +
                  "</span><span>" + formatPeriod(item) + "</span></div>" +
                  '<h3 class="project-title">' + escapeHtml(title) + "</h3>" +
                  '<p class="project-role">' + UI[state.language].role + " · " +
                    escapeHtml(localize(item.role)) + "</p>" +
                  '<p class="project-summary">' + escapeHtml(localize(item.summary)) + "</p>" +
                  highlights +
                  tags +
                "</div>" +
              "</article>"
            );
          }).join("") +
        "</div>" +
      "</section>"
    );
  }

  function renderPublications() {
    var items = state.data.publications;
    if (!hasItems(items)) {
      return "";
    }
    return (
      '<section class="content-section" id="publications" aria-labelledby="publications-title">' +
        sectionHeading("publications", UI[state.language].publications, items.length) +
        '<div class="timeline-list">' +
          items.map(function (item) {
            var subtitle = [localize(item.type), localize(item.venue)].filter(Boolean).join(" · ");
            return (
              '<article class="timeline-item">' +
                '<div class="timeline-date">' + escapeHtml(item.year || "") + "</div>" +
                '<div class="timeline-content">' +
                  "<h3>" + escapeHtml(localize(item.title)) + "</h3>" +
                  '<p class="timeline-subtitle">' + escapeHtml(subtitle) + "</p>" +
                  (isPresent(item.authors)
                    ? '<p class="timeline-description">' + escapeHtml(localize(item.authors)) + "</p>"
                    : "") +
                "</div>" +
              "</article>"
            );
          }).join("") +
        "</div>" +
      "</section>"
    );
  }

  function renderAwards() {
    var items = state.data.awards;
    if (!hasItems(items)) {
      return "";
    }
    return (
      '<section class="content-section" id="awards" aria-labelledby="awards-title">' +
        sectionHeading("awards", UI[state.language].awards, items.length) +
        '<div class="timeline-list">' +
          items.map(function (item) {
            return (
              '<article class="timeline-item">' +
                '<div class="timeline-date">' + escapeHtml(item.year || "") + "</div>" +
                '<div class="timeline-content">' +
                  "<h3>" + escapeHtml(localize(item.title)) + "</h3>" +
                  '<p class="timeline-subtitle">' + escapeHtml(localize(item.organization)) + "</p>" +
                  (isPresent(item.description)
                    ? '<p class="timeline-description">' + escapeHtml(localize(item.description)) + "</p>"
                    : "") +
                "</div>" +
              "</article>"
            );
          }).join("") +
        "</div>" +
      "</section>"
    );
  }

  function renderSkills() {
    var groups = state.data.skills;
    if (!hasItems(groups)) {
      return "";
    }
    return (
      '<section class="content-section" id="skills" aria-labelledby="skills-title">' +
        sectionHeading("skills", UI[state.language].skills, groups.length) +
        '<div class="skills-grid">' +
          groups.map(function (group) {
            return (
              '<article class="skill-group">' +
                "<h3>" + escapeHtml(localize(group.category)) + "</h3>" +
                '<div class="skill-chip-list">' +
                  group.items.map(function (item) {
                    return '<span class="skill-chip">' + escapeHtml(localize(item)) + "</span>";
                  }).join("") +
                "</div>" +
              "</article>"
            );
          }).join("") +
        "</div>" +
      "</section>"
    );
  }

  function visibleSections() {
    var data = state.data;
    return [
      { id: "about", label: UI[state.language].about, visible: isPresent(data.profile.about) },
      { id: "education", label: UI[state.language].education, visible: hasItems(data.education) },
      { id: "experience", label: UI[state.language].experience, visible: hasItems(data.experience) },
      { id: "projects", label: UI[state.language].projects, visible: hasItems(data.projects) },
      { id: "publications", label: UI[state.language].publications, visible: hasItems(data.publications) },
      { id: "awards", label: UI[state.language].awards, visible: hasItems(data.awards) },
      { id: "skills", label: UI[state.language].skills, visible: hasItems(data.skills) }
    ].filter(function (section) {
      return section.visible;
    });
  }

  function renderNavigation() {
    elements.nav.innerHTML = visibleSections().map(function (section, index) {
      return (
        '<a class="navigation-link" href="#' + section.id + '"' +
        (index === 0 ? ' aria-current="true"' : "") + ">" +
        escapeHtml(section.label) +
        "</a>"
      );
    }).join("");
  }

  function updateControls() {
    var ui = UI[state.language];
    var isDark = state.theme === "dark";
    var isMetaverse = state.view === "metaverse";
    elements.root.lang = state.language;
    elements.root.dataset.theme = state.theme;
    elements.root.dataset.view = state.view;
    elements.headerName.textContent = localize(state.data.profile.displayName);
    elements.languageButton.textContent = state.language === "ko" ? "EN" : "한";
    elements.languageButton.setAttribute("aria-label", ui.language);
    elements.languageButton.title = ui.language;
    elements.printButton.setAttribute("aria-label", ui.print);
    elements.printButton.title = ui.print;
    elements.themeButton.setAttribute("aria-label", isDark ? ui.themeLight : ui.themeDark);
    elements.themeButton.title = isDark ? ui.themeLight : ui.themeDark;
    elements.viewButton.setAttribute("aria-label", isMetaverse ? ui.viewClassic : ui.viewMetaverse);
    elements.viewButton.setAttribute("aria-pressed", String(isMetaverse));
    elements.viewButton.title = isMetaverse ? ui.viewClassic : ui.viewMetaverse;
    elements.menuButton.setAttribute(
      "aria-label",
      elements.body.classList.contains("nav-open") ? ui.menuClose : ui.menuOpen
    );
    elements.dialogClose.setAttribute("aria-label", ui.closeImage);
    document.title = escapeHtml(localize(state.data.profile.name)) + " CV";
  }

  function syncMetaverse() {
    var enabled = state.view === "metaverse";
    elements.root.dataset.view = state.view;
    if (window.MyHubMetaverse) {
      window.MyHubMetaverse.setEnabled(enabled);
      window.MyHubMetaverse.setTheme(state.theme);
      return;
    }
    window.dispatchEvent(new CustomEvent("myhub-view-change", {
      detail: { enabled: enabled, theme: state.theme }
    }));
  }

  function renderAll() {
    renderProfile();
    elements.content.innerHTML =
      renderIntro() +
      renderEducation() +
      renderExperience() +
      renderProjects() +
      renderPublications() +
      renderAwards() +
      renderSkills();
    renderNavigation();
    updateControls();
    observeSections();
  }

  function observeSections() {
    if (state.observer) {
      state.observer.disconnect();
    }
    var links = Array.prototype.slice.call(document.querySelectorAll(".navigation-link"));
    var sections = visibleSections()
      .map(function (item) {
        return document.getElementById(item.id);
      })
      .filter(Boolean);

    if (!("IntersectionObserver" in window) || !sections.length) {
      return;
    }

    state.observer = new IntersectionObserver(function (entries) {
      var visible = entries
        .filter(function (entry) {
          return entry.isIntersecting;
        })
        .sort(function (a, b) {
          return b.intersectionRatio - a.intersectionRatio;
        });
      if (!visible.length) {
        return;
      }
      var activeId = visible[0].target.id;
      links.forEach(function (link) {
        if (link.getAttribute("href") === "#" + activeId) {
          link.setAttribute("aria-current", "true");
        } else {
          link.removeAttribute("aria-current");
        }
      });
    }, {
      root: window.matchMedia("(min-width: 769px)").matches ? elements.content : null,
      rootMargin: "-18% 0px -60% 0px",
      threshold: [0.05, 0.2, 0.5]
    });

    sections.forEach(function (section) {
      state.observer.observe(section);
    });
  }

  function closeMenu() {
    elements.body.classList.remove("nav-open");
    elements.menuButton.setAttribute("aria-expanded", "false");
    if (state.data) {
      updateControls();
    }
  }

  function openMedia(button) {
    var source = button.getAttribute("data-media");
    var caption = button.getAttribute("data-caption");
    elements.dialogImage.src = source;
    elements.dialogImage.alt = caption;
    elements.dialogCaption.textContent = caption;
    if (typeof elements.dialog.showModal === "function") {
      elements.dialog.showModal();
    }
  }

  function bindEvents() {
    elements.languageButton.addEventListener("click", function () {
      if (!state.data) {
        return;
      }
      state.language = state.language === "ko" ? "en" : "ko";
      savePreference(STORAGE_KEYS.language, state.language);
      closeMenu();
      renderAll();
    });

    elements.themeButton.addEventListener("click", function () {
      state.theme = state.theme === "light" ? "dark" : "light";
      savePreference(STORAGE_KEYS.theme, state.theme);
      elements.root.dataset.theme = state.theme;
      syncMetaverse();
      if (state.data) {
        updateControls();
      }
    });

    elements.viewButton.addEventListener("click", function () {
      state.view = state.view === "classic" ? "metaverse" : "classic";
      savePreference(STORAGE_KEYS.view, state.view);
      syncMetaverse();
      if (state.data) {
        updateControls();
      }
    });

    elements.printButton.addEventListener("click", function () {
      closeMenu();
      window.print();
    });

    elements.menuButton.addEventListener("click", function () {
      var open = elements.body.classList.toggle("nav-open");
      elements.menuButton.setAttribute("aria-expanded", String(open));
      if (state.data) {
        updateControls();
      }
    });

    elements.nav.addEventListener("click", function (event) {
      if (event.target.closest("a")) {
        closeMenu();
      }
    });

    elements.content.addEventListener("click", function (event) {
      var button = event.target.closest("[data-media]");
      if (button) {
        openMedia(button);
      }
    });

    elements.dialogClose.addEventListener("click", function () {
      elements.dialog.close();
    });

    elements.dialog.addEventListener("click", function (event) {
      if (event.target === elements.dialog) {
        elements.dialog.close();
      }
    });

    window.addEventListener("beforeprint", function () {
      elements.root.setAttribute("data-print-theme", "light");
    });

    window.addEventListener("afterprint", function () {
      elements.root.removeAttribute("data-print-theme");
    });

    var desktopLayout = window.matchMedia("(min-width: 769px)").matches;
    window.addEventListener("resize", function () {
      var nextDesktopLayout = window.matchMedia("(min-width: 769px)").matches;
      if (desktopLayout !== nextDesktopLayout && state.data) {
        desktopLayout = nextDesktopLayout;
        observeSections();
      }
    });
  }

  async function loadData() {
    var response = await fetch("data.json");
    if (!response.ok) {
      throw new Error("Unable to load data.json");
    }
    return response.json();
  }

  async function initialize() {
    elements.root.dataset.theme = state.theme;
    elements.root.dataset.view = state.view;
    bindEvents();
    syncMetaverse();
    try {
      state.data = await loadData();
      renderAll();
    } catch (error) {
      elements.profile.innerHTML = "";
      elements.content.innerHTML =
        '<div class="error-state" role="alert">' +
        escapeHtml(UI[state.language].loadError) +
        "</div>";
    }
  }

  initialize();
})();
