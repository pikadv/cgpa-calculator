let innerList = `
<label>
Subject Name:
<input class="subj-inp" type="text" value="Subject " name="SubjectName">
</label>

<label>
Grade:
<input class="subj-grade" type="text" min="1" max="5" name="Grade">
</label>

<a src="#" class="a-btn">❌</a>
`

const APP_BODY = document.getElementById("app-body")
const TAP_BODY = document.querySelector(".tap-body")
const FORM = document.getElementById("form")
const RESULT = document.querySelector(".result")
const CALC = document.getElementById("calc")

subjectCount()

// EventListeners ----------------------------------------
TAP_BODY.addEventListener("click", () => {
  clickToAdd()
  subjectCount()
})

FORM.addEventListener("submit", (e) => {
  e.preventDefault()
  showResult()
})

// Functions ----------------------------------------------
function hideBtn() {
  if (APP_BODY.children.length == 2) {
    CALC.classList.add("hidden")
    RESULT.classList.add("hidden")
  } else {
    CALC.classList.remove("hidden")
  }
}

function subjectCount() {
  newCount = APP_BODY.childElementCount
  count = newCount - 2
  hideBtn()
}

function clickToAdd() {
  const newList = document.createElement("div")
  newList.classList.add("li")
  newList.innerHTML = innerList
  APP_BODY.appendChild(newList)

  count++
  newList.querySelector(".subj-inp").value += count

  newList.querySelector(".a-btn").addEventListener("click", (e) => {
    e.preventDefault
    newList.remove()
    subjectCount()
  })
}

function showResult() {
  const grades = APP_BODY.querySelectorAll(".subj-grade")

  let sum = 0
  getGrade()
  let gpa = 0
  gpa = (sum / grades.length).toFixed(2)

  if (isNaN(gpa) || gpa > 4) {
    RESULT.textContent = "Please add your grades properly"
  } else {
    RESULT.textContent = `Your CGPA: ${gpa}`
  }
  RESULT.classList.remove("hidden")

  function getGrade() {
    grades.forEach((grade) => {
      console.log(grade.value)
      if (grade.value == "A+" || grade.value == "a+") {
        sum += 4.0
      } else if (grade.value == "A" || grade.value == "a") {
        sum += 3.75
      } else if (grade.value == "A-" || grade.value == "a-") {
        sum += 3.5
      } else if (grade.value == "B++" || grade.value == "b+") {
        sum += 3.25
      } else if (grade.value == "B" || grade.value == "b") {
        sum += 3.0
      } else if (grade.value == "B-" || grade.value == "b-") {
        sum += 2.75
      } else if (grade.value == "C+" || grade.value == "c+") {
        sum += 2.5
      } else if (grade.value == "C" || grade.value == "c") {
        sum += 2.25
      } else if (grade.value == "D" || grade.value == "d") {
        sum += 2.0
      } else if (grade.value == "F" || grade.value == "f") {
        sum += 0.0
      } else {
        sum += parseFloat(grade.value)
      }
    })
    console.log(sum)
  }
}
