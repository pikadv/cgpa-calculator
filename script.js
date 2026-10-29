(() => {
  const template = document.getElementById("subject-template");
  const courses = document.getElementById("subjects-container");
  const form = document.getElementById("form-container");
  const departmentInput = document.getElementById("department");
  const yearSelect = document.getElementById("academic-year");
  const syllabusSelect = document.getElementById("syllabus-version");
  const programmeSelect = document.getElementById("programme");
  const departmentOptions = document.getElementById("department-options");
  const selectionStatus = document.getElementById("selection-status");
  const addOne = document.getElementById("add-one");
  const reset = document.getElementById("reset");
  const error = document.getElementById("error-message");
  const result = document.getElementById("result");
  const grade = document.getElementById("grade");
  const totalCreditsOutput = document.getElementById("total-credits");
  const qualityPointsOutput = document.getElementById("quality-points");
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

  function configureProgrammeOptions() {
    const config = catalogue.programmes && catalogue.programmes[programmeSelect.value];
    if (!config) return;
    departments = config.departments || [];
    departmentOptions.replaceChildren();
    departments.forEach(name => {
      const option = document.createElement("option");
      option.value = name;
      departmentOptions.appendChild(option);
    });
    fillSelect(yearSelect, config.yearOptions || []);
    fillSelect(syllabusSelect, config.syllabusVersions || []);
    departmentInput.value = "";
    courses.replaceChildren();
    resetResults();
    selectionStatus.textContent = `Choose a department for ${config.label}, then select the syllabus version. Only available course lists will auto-load; other departments remain available for manual entry.`;
  }

  // The course catalogue lives in syllabus.json so it can be updated without editing the UI.
  // The JSON is loaded once from the same GitHub Pages origin.
  let syllabus = {};
  let catalogue = {};
  let departments = [];
  let syllabusLoadError = false;
  const syllabusReady = fetch("./syllabus.json", { cache: "no-cache" })
    .then(response => {
      if (!response.ok) throw new Error("HTTP " + response.status);
      return response.json();
    })
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
    qualityPointsOutput.textContent = "0.00";
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
    credit.value = course.credits || "3";
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
    const list = entry && entry.courses;
    if (Array.isArray(list) && list.length) {
      list.forEach(course => addCourse(course));
      selectionStatus.textContent = `Loaded ${list.length} courses for ${programmeLabel} · ${department} · ${versionLabel} · ${yearSelect.options[yearSelect.selectedIndex].text}. Source: ${entry.sourceLabel || "syllabus catalogue"}. Verification: ${entry.verified ? "verified" : "not verified"}; check electives against the official document.`;
    } else {
      selectionStatus.textContent = `Department listed for ${programmeLabel}, but no course list has been extracted for ${department} · ${versionLabel} · ${yearSelect.options[yearSelect.selectedIndex].text}. Add subjects manually; no courses or credits have been invented.`;
    }
  }

  // Selector order: programme -> department -> academic year -> syllabus version -> subjects.
  programmeSelect.addEventListener("change", configureProgrammeOptions);
  departmentInput.addEventListener("change", loadSelectedSyllabus);
  departmentInput.addEventListener("input", () => {
    const normalized = departmentInput.value.trim().toLowerCase();
    if (departments.some(name => name.toLowerCase() === normalized)) loadSelectedSyllabus();
  });
  departmentInput.addEventListener("keydown", event => {
    if (event.key === "Enter") { event.preventDefault(); loadSelectedSyllabus(); }
  });
  yearSelect.addEventListener("change", loadSelectedSyllabus);
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
    qualityPointsOutput.textContent = qualityPoints.toFixed(2);
    courseCountOutput.textContent = String(entered.length);
    const department = departmentInput.value.trim();
    result.textContent = cgpa >= 3 ? `Strong result${department ? " for " + department : ""}. This is an estimated credit-weighted GPA / CGPA.`
      : cgpa >= 2 ? "Your estimated GPA / CGPA is shown above. Check your programme's promotion rules."
      : "Your estimated GPA / CGPA is shown above. Check your programme's pass and improvement rules.";
  });

  // Start with no course rows. The JSON catalogue configures year/version choices
  // for the default programme when it finishes loading.
})();
</script>
</body>
</html
