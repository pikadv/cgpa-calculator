(() => {
  const template = document.getElementById("subject-template");
  const courses = document.getElementById("subjects-container");
  const form = document.getElementById("form-container");
  const departmentInput = document.getElementById("department");
  const yearSelect = document.getElementById("academic-year");
  const syllabusSelect = document.getElementById("syllabus-version");
  const programmeSelect = document.getElementById("programme");
  
  const selectionStatus = document.getElementById("selection-status");
  const addOne = document.getElementById("add-one");
  const reset = document.getElementById("reset");
  const error = document.getElementById("error-message");
  const result = document.getElementById("result");
  const grade = document.getElementById("grade");
  const totalCreditsOutput = document.getElementById("total-credits");
  const courseCountOutput = document.getElementById("course-count");

  function fillSelect(select, options) {
    select.replaceChildren();
    options.forEach(item => {
      const option = document.createElement("option");
      option.value = String(item.value);
      option.textContent = item.label;
      select.appendChild(option);
    });
  }

  function usableEntries(programme, department, year, version) {
    const normalizedDepartment = department?.toLowerCase().replace(/\\s+/g, " ").trim();
    return Object.entries(syllabus).filter(([key, entry]) => {
      if (!entry || !Array.isArray(entry.courses) || entry.courses.length === 0) return false;
      const [entryProgramme, entryVersion, entryDepartment, entryYear] = key.split("|");
      return entryProgramme === programme
        && (!version || entryVersion === version)
        && (!normalizedDepartment || entryDepartment === normalizedDepartment)
        && (!year || entryYear === String(year));
    }).map(([, entry]) => entry);
  }

  function availableOptions(options, values) {
    const allowed = new Set(values);
    return (options || []).filter(option => allowed.has(String(option.value)));
  }

  function configureProgrammeOptions() {
    const programme = programmeSelect.value;
    const config = catalogue.programmes && catalogue.programmes[programme];
    if (!config) return;

    const previousDepartment = departmentInput.value;
    const previousYear = yearSelect.value;
    const previousVersion = syllabusSelect.value;

    const matchingDepartments = new Set(Object.keys(syllabus).flatMap(key => {
      const [entryProgramme, entryVersion, entryDepartment] = key.split("|");
      const entry = syllabus[key];
      return entryProgramme === programme && entry && Array.isArray(entry.courses) && entry.courses.length
        ? [entryDepartment]
        : [];
    }));
    departments = (config.departments || []).filter(name =>
      matchingDepartments.has(name.toLowerCase().replace(/\\s+/g, " ").trim())
    );

    departmentInput.replaceChildren();
    const prompt = document.createElement("option");
    prompt.value = "";
    prompt.textContent = "Choose a department";
    departmentInput.appendChild(prompt);
    const categoryOrder = ["Business Administration", "Arts", "Science", "Social Science", "Life & Earth Science", "Library & Information Science", "Other / Interdisciplinary"];
    const grouped = config.departmentGroups || {};
    categoryOrder.forEach(category => {
      const names = (grouped[category] || []).filter(name => departments.includes(name));
      if (!names.length) return;
      const group = document.createElement("optgroup");
      group.label = category;
      names.slice().sort((a, b) => a.localeCompare(b)).forEach(name => {
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        group.appendChild(option);
      });
      departmentInput.appendChild(group);
    });

    departmentInput.value = departments.includes(previousDepartment) ? previousDepartment : "";
    const entries = usableEntries(programme, departmentInput.value);
    const selectedEntry = entries.find(entry =>
      entry.syllabusVersion === previousVersion && String(entry.year) === previousYear
    ) || entries[0];
    const selectedVersion = selectedEntry?.syllabusVersion || "";
    const selectedYear = selectedEntry ? String(selectedEntry.year) : "";
    const matchingYears = new Set(entries
      .filter(entry => entry.syllabusVersion === selectedVersion)
      .map(entry => String(entry.year)));
    const yearOptions = availableOptions(config.yearOptions, matchingYears);
    fillSelect(yearSelect, yearOptions);
    yearSelect.value = yearOptions.some(option => String(option.value) === previousYear)
      ? previousYear : selectedYear;

    const matchingVersions = new Set(entries
      .filter(entry => String(entry.year) === yearSelect.value)
      .map(entry => entry.syllabusVersion));
    const versionOptions = availableOptions(config.syllabusVersions, matchingVersions);
    fillSelect(syllabusSelect, versionOptions);
    syllabusSelect.value = versionOptions.some(option => String(option.value) === previousVersion)
      ? previousVersion : selectedVersion;

    courses.replaceChildren();
    resetResults();
    selectionStatus.textContent = departments.length
      ? `Choose a department for ${config.label}, then select an available academic year and syllabus version. You can add courses manually at any time.`
      : `No usable course lists are available for ${config.label} yet. You can still add courses manually.`;
  }

  function refreshDependentOptions() {
    const programme = programmeSelect.value;
    const config = catalogue.programmes && catalogue.programmes[programme];
    if (!config) return;
    const department = departmentInput.value;
    const oldYear = yearSelect.value;
    const oldVersion = syllabusSelect.value;
    const entries = usableEntries(programme, department);
    const selectedEntry = entries.find(entry =>
      entry.syllabusVersion === oldVersion && String(entry.year) === oldYear
    ) || entries[0];
    const selectedVersion = selectedEntry?.syllabusVersion || "";
    const selectedYear = selectedEntry ? String(selectedEntry.year) : "";

    const matchingYears = new Set(entries
      .filter(entry => entry.syllabusVersion === selectedVersion)
      .map(entry => String(entry.year)));
    const yearOptions = availableOptions(config.yearOptions, matchingYears);
    fillSelect(yearSelect, yearOptions);
    yearSelect.value = yearOptions.some(option => String(option.value) === oldYear)
      ? oldYear : selectedYear;

    const matchingVersions = new Set(entries
      .filter(entry => String(entry.year) === yearSelect.value)
      .map(entry => entry.syllabusVersion));
    const versionOptions = availableOptions(config.syllabusVersions, matchingVersions);
    fillSelect(syllabusSelect, versionOptions);
    syllabusSelect.value = versionOptions.some(option => String(option.value) === oldVersion)
      ? oldVersion : selectedVersion;
  }

  // The course catalogue lives in syllabus.json so it can be updated without editing the UI.
  // The JSON is loaded once from the same GitHub Pages origin.
  let syllabus = {};
  let catalogue = {};
  let departments = [];
  let syllabusLoadError = false;
  const loadSyllabusCatalogue = async () => {
    let lastError;
    // Try the page-relative path first, then the site-root path for custom-domain deployments.
    for (const path of ["./syllabus.json", "/syllabus.json"]) {
      try {
        const response = await fetch(path, { cache: "no-cache" });
        if (!response.ok) throw new Error("HTTP " + response.status + " for " + path);
        return await response.json();
      } catch (err) {
        lastError = err;
      }
    }
    throw lastError || new Error("Unable to fetch syllabus.json");
  };
  const syllabusReady = loadSyllabusCatalogue()
    .then(data => {
      catalogue = data;
      syllabus = data.syllabuses || {};
      configureProgrammeOptions();
      return true;
    })
    .catch(err => {
      syllabusLoadError = true;
      console.error("Could not load syllabus.json", err);
      selectionStatus.textContent = "The syllabus catalogue could not be loaded. You can still add courses manually.";
      return false;
    });

  function clearError() { error.hidden = true; error.textContent = ""; }
  function resetResults() {
    grade.textContent = "—";
    result.textContent = "Add your course grades to get started.";
    totalCreditsOutput.textContent = "0";
    courseCountOutput.textContent = "0";
  }
  function renumberCourses() {
    [...courses.querySelectorAll("[data-subject]")].forEach((row, index) => {
      const name = row.querySelector("[data-visible-name]");
      name.placeholder = `Course / subject ${index + 1}`;
      name.setAttribute("aria-label", `Course / subject ${index + 1}`);
    });
  }
  function addCourse(course = {}) {
    const fragment = template.content.cloneNode(true);
    const row = fragment.querySelector("[data-subject]");
    const name = row.querySelector("[data-visible-name]");
    const credit = row.querySelector("[data-visible-credit]");
    const gradeSelect = row.querySelector("[data-subject-grade]");
    const remove = row.querySelector("[data-delete-button]");
    name.value = course.name || "";
    credit.value = course.credits ?? "4";
    if (course.code) {
      name.value = course.code + " — " + course.name;
      name.title = "Course code: " + course.code;
    }
    remove.addEventListener("click", () => {
      row.remove(); renumberCourses(); clearError();
    });
    [name, credit, gradeSelect].forEach(input => {
      input.addEventListener("input", clearError);
      input.addEventListener("change", clearError);
    });
    courses.appendChild(fragment);
    renumberCourses();
  }
  async function loadSelectedSyllabus() {
    clearError();
    const department = departmentInput.value.trim();
    const year = yearSelect.value;
    const version = syllabusSelect.value;
    const programme = programmeSelect.value;
    const programmeConfig = catalogue.programmes && catalogue.programmes[programme];
    const programmeLabel = programmeConfig ? programmeConfig.label : programme;
    const versionLabel = syllabusSelect.options[syllabusSelect.selectedIndex]?.text || version;
    courses.replaceChildren();
    resetResults();
    if (!department) {
      selectionStatus.textContent = `Choose a department for ${programmeLabel}, then choose the academic year and syllabus version.`;
      return;
    }
    selectionStatus.textContent = "Loading the syllabus catalogue…";
    const ready = await syllabusReady;
    if (!ready || syllabusLoadError) {
      selectionStatus.textContent = "The syllabus catalogue could not be loaded. You can still add subjects manually.";
      return;
    }
    const normalizedDepartment = department.toLowerCase().replace(/\s+/g, " ").trim();
    const key = programme + "|" + version + "|" + normalizedDepartment + "|" + year;
    const entry = syllabus[key];
    let list = entry && Array.isArray(entry.courses) ? entry.courses.slice() : [];
    const artsDepartments = (programmeConfig?.departmentGroups?.Arts || []).map(name =>
      name.toLowerCase().replace(/\\s+/g, " ").trim()
    );
    if (artsDepartments.includes(normalizedDepartment)) {
      const sharedCourseKeys = {
        "2013-2014|2": [
          "pass|2013-2014|english (compulsory)|2"
        ],
        "2013-2014|3": [
          "pass|2013-2014|bangla national language (compulsory)|3"
        ],
        "2025-2026-degree|1": [
          "pass|2025-2026-degree|english (compulsory)|1"
        ]
      };
      (sharedCourseKeys[`${version}|${year}`] || []).forEach(sharedKey => {
        const sharedEntry = syllabus[sharedKey];
        if (sharedEntry && Array.isArray(sharedEntry.courses)) {
          list = list.concat(sharedEntry.courses);
        }
      });
    }
    if (list.length) {
      list.forEach(course => addCourse(course));
      selectionStatus.textContent = `Loaded ${list.length} course entries for ${programmeLabel} · ${department} · ${versionLabel} · ${yearSelect.options[yearSelect.selectedIndex].text}. Source: ${entry?.sourceLabel || "syllabus catalogue"}. ${entry?.verificationNote || "Check the official syllabus before calculating."}`;
    } else {
      selectionStatus.textContent = `Department listed for ${programmeLabel}, but no course list has been extracted for ${department} · ${versionLabel} · ${yearSelect.options[yearSelect.selectedIndex].text}. Add subjects manually; no courses or credits have been invented.`;
    }
  }

  // Selector order: programme -> department -> academic year -> syllabus version -> subjects.
  programmeSelect.addEventListener("change", configureProgrammeOptions);
  departmentInput.addEventListener("change", () => {
    refreshDependentOptions();
    loadSelectedSyllabus();
  });
  yearSelect.addEventListener("change", () => {
    refreshDependentOptions();
    loadSelectedSyllabus();
  });
  syllabusSelect.addEventListener("change", loadSelectedSyllabus);

  addOne.addEventListener("click", () => addCourse());
  reset.addEventListener("click", () => {
    courses.replaceChildren(); resetResults(); clearError();
    selectionStatus.textContent = "Courses cleared. Choose a department, syllabus version, and academic year to load an available list, or add courses manually.";
  });

  form.addEventListener("submit", event => {
    event.preventDefault();
    clearError();
    const rows = [...courses.querySelectorAll("[data-subject]")];
    const entered = rows.filter(row => row.querySelector("[data-subject-grade]").value !== "");
    if (!entered.length) {
      error.textContent = "Select a grade for at least one course before calculating.";
      error.hidden = false; return;
    }
    let totalCredits = 0, qualityPoints = 0, invalid = false;
    entered.forEach(row => {
      const credit = Number(row.querySelector("[data-visible-credit]").value);
      const selectedGrade = row.querySelector("[data-subject-grade]").value;
      if (!Number.isFinite(credit) || credit <= 0 || credit > 30 || selectedGrade === "") { invalid = true; return; }
      totalCredits += credit;
      qualityPoints += credit * Number(selectedGrade);
    });
    if (invalid || totalCredits <= 0) {
      error.textContent = "Enter a valid credit value (greater than 0 and no more than 30) for each course with a selected grade.";
      error.hidden = false; return;
    }
    const cgpa = qualityPoints / totalCredits;
    grade.textContent = cgpa.toFixed(2);
    totalCreditsOutput.textContent = Number(totalCredits.toFixed(2)).toString();
    courseCountOutput.textContent = String(entered.length);
    const department = departmentInput.value.trim();
    result.textContent = cgpa >= 3 ? `Strong result${department ? " for " + department : ""}. This is an estimated credit-weighted GPA / CGPA.`
      : cgpa >= 2 ? "Your estimated GPA / CGPA is shown above. Check your programme's promotion rules."
      : "Your estimated GPA / CGPA is shown above. Check your programme's pass and improvement rules.";
  });

  // Start with no course rows. The JSON catalogue configures year/version choices
  // for the default programme when it finishes loading.
})();
