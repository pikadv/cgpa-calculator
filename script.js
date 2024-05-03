// template from dom
const subjectTemplate = document.getElementById("subject-template")

// dom grabs
const subjectsContainer = document.querySelector("[data-subjects-container]")
const calculatedGrade = document.querySelector("[data-calculated-grade]")
const calculatedResult = document.querySelector("[data-calculated-result]")
const dataForm = document.querySelector("[data-form]")

// buttons
const addOne = document.querySelector("[data-add-one]")
const addFive = document.querySelector("[data-add-five]")
const calculateButton = document.querySelector("[data-calculate-button]")

addEventListener("click", () => {
  const totalSubjects = document.querySelectorAll("[data-subject]")
  if (totalSubjects.length < 1) {
    calculateButton.classList.add("hidden")
  } else {
    calculateButton.classList.remove("hidden")
  }
})

addOne.addEventListener("click", (e) => {
  e.preventDefault()
  addSubjects(1)
})

addFive.addEventListener("click", (e) => {
  e.preventDefault()
  addSubjects(5)
})

function addSubjects(subjectNumber) {
  for (i = 0; i < subjectNumber; i++) {
    const subjectItem = subjectTemplate.content.cloneNode(true)
    const subject = subjectItem.querySelector("[data-subject]")
    const subjectName = subjectItem.querySelector("[data-subject-name]")
    const deleteButton = subjectItem.querySelector("[data-delete-button]")
    subjectName.placeholder = `Subject ${subjectsContainer.children.length + 1}`
    subjectsContainer.appendChild(subject)
    deleteButton.addEventListener("click", () => {
      subject.remove()
    })
  }
}

dataForm.addEventListener("submit", (e) => {
  e.preventDefault()
  const subjectGrades = document.querySelectorAll("[data-subject-grade]")

  let totalGrade = 0
  let result = ""
  let passed = true
  let overFour = false

  getGrade()
  let CGPA = totalGrade / subjectGrades.length
  if (isNaN(CGPA)) return

  getResult()
  if (overFour) {
    calculatedGrade.textContent = "eh?"
  } else {
    calculatedGrade.textContent = CGPA.toFixed(2)
  }
  
  calculatedResult.textContent = result

  function getGrade() {
    subjectGrades.forEach((grade) => {
      if (grade.value == "A+" || grade.value == "a+") {
        totalGrade += 4.0
      } else if (grade.value == "A" || grade.value == "a") {
        totalGrade += 3.75
      } else if (grade.value == "A-" || grade.value == "a-") {
        totalGrade += 3.5
      } else if (grade.value == "B+" || grade.value == "b+") {
        totalGrade += 3.25
      } else if (grade.value == "B" || grade.value == "b") {
        totalGrade += 3.0
      } else if (grade.value == "B-" || grade.value == "b-") {
        totalGrade += 2.75
      } else if (grade.value == "C+" || grade.value == "c+") {
        totalGrade += 2.5
      } else if (grade.value == "C" || grade.value == "c") {
        totalGrade += 2.25
      } else if (grade.value == "D" || grade.value == "d") {
        totalGrade += 2.0
      } else if (grade.value == "F" || grade.value == "f") {
        totalGrade += 0.0
        passed = false
      } else if (grade.value > 4) {
        overFour = true
      } else {
        totalGrade += parseFloat(grade.value)
      }
    })
  }

  function getResult() {
    if (overFour)
      return (result = `How are you getting GPA over 4 in National University breh?`)

    if (CGPA >= 3.0 && passed) {
      result = "Wooohoo!! 1st Class!!"
    } else if (CGPA >= 2.25 && passed) {
      result = "You passed! 2nd Class!"
    } else if (CGPA >= 2.0 && passed) {
      result = "You did it! You passed with 3rd Class."
    } else {
      result = "Sorry :( you Failed."
    }
  }
})
