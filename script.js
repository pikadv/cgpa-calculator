(() => {
  const template = document.getElementById("subject-template");
  const courses = document.getElementById("subjects-container");
  const form = document.getElementById("form-container");
  const addOne = document.getElementById("add-one");
  const addFive = document.getElementById("add-five");
  const reset = document.getElementById("reset");
  const error = document.getElementById("error-message");
  const result = document.getElementById("result");
  const grade = document.getElementById("grade");
  const totalCreditsOutput = document.getElementById("total-credits");
  const qualityPointsOutput = document.getElementById("quality-points");
  const courseCountOutput = document.getElementById("course-count");

  function addCourse() {
    const fragment = template.content.cloneNode(true);
    const row = fragment.querySelector("[data-subject]");
    const name = row.querySelector("[data-visible-name]");
    const credit = row.querySelector("[data-visible-credit]");
    const gradeSelect = row.querySelector("[data-subject-grade]");
    const remove = row.querySelector("[data-delete-button]");
    name.value = "";
    credit.value = "3";
    remove.addEventListener("click", () => {
      row.remove();
      renumberCourses();
      clearError();
    });
    [name, credit, gradeSelect].forEach((input) => {
      input.addEventListener("input", clearError);
      input.addEventListener("change", clearError);
    });
    courses.appendChild(fragment);
    renumberCourses();
  }

  function renumberCourses() {
    [...courses.querySelectorAll("[data-subject]")].forEach((row, index) => {
      const name = row.querySelector("[data-visible-name]");
      name.placeholder = `Course / subject ${index + 1}`;
      name.setAttribute("aria-label", `Course / subject ${index + 1}`);
    });
  }

  function clearError() {
    error.hidden = true;
    error.textContent = "";
  }

  addOne.addEventListener("click", addCourse);
  addFive.addEventListener("click", () => {
    for (let i = 0; i < 5; i++) addCourse();
  });

  reset.addEventListener("click", () => {
    courses.replaceChildren();
    addCourse();
    grade.textContent = "—";
    result.textContent = "Add your course grades to get started.";
    totalCreditsOutput.textContent = "0";
    qualityPointsOutput.textContent = "0.00";
    courseCountOutput.textContent = "0";
    clearError();
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    clearError();

    const rows = [...courses.querySelectorAll("[data-subject]")];
    const entered = rows.filter((row) => row.querySelector("[data-subject-grade]").value !== "");
    if (entered.length === 0) {
      error.textContent = "Select a grade for at least one course before calculating.";
      error.hidden = false;
      return;
    }

    let totalCredits = 0;
    let qualityPoints = 0;
    let invalid = false;

    entered.forEach((row) => {
      const credit = Number(row.querySelector("[data-visible-credit]").value);
      const selectedGrade = row.querySelector("[data-subject-grade]").value;
      if (!Number.isFinite(credit) || credit <= 0 || credit > 30 || selectedGrade === "") {
        invalid = true;
        return;
      }
      totalCredits += credit;
      qualityPoints += credit * Number(selectedGrade);
    });

    if (invalid || totalCredits <= 0) {
      error.textContent = "Please enter a valid credit value (greater than 0 and no more than 30) for every course with a selected grade.";
      error.hidden = false;
      return;
    }

    const cgpa = qualityPoints / totalCredits;
    grade.textContent = cgpa.toFixed(2);
    totalCreditsOutput.textContent = Number(totalCredits.toFixed(2)).toString();
    qualityPointsOutput.textContent = qualityPoints.toFixed(2);
    courseCountOutput.textContent = String(entered.length);

    const department = document.getElementById("department").value.trim();
    const label = department ? ` for ${department}` : "";
    result.textContent = cgpa >= 3 ? `Strong result${label}. This is an estimated credit-weighted GPA / CGPA.`
      : cgpa >= 2 ? `Your estimated GPA / CGPA${label} is shown above. Check your programme's promotion rules.`
      : `Your estimated GPA / CGPA${label} is shown above. Check your programme's pass and improvement rules.`;
  });

  addCourse();
})();