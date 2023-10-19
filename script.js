let innerList = `
<label class="subj-label">
Subject Name:
<input class="subj-input" type="text" value="Subject " name="SubjectName">
</label>

<label class="subj-label">
Grade:
<input class="subj-grade" placeholder="Your grade" type="text" name="Grade">
</label>

<a src="#" class="a-btn">❌</a>
`

const APP_BODY = document.getElementById("app-body")
const TAP_BODY = document.getElementById("tap-body")
const FORM = document.getElementById("form")
const RESULT = document.getElementById("result")
const CALC_BTN = document.getElementById("calc-btn")

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

RESULT.addEventListener("click", () => {
  RESULT.classList.add("hidden")
})

// Functions ----------------------------------------------
function hideBtn() {
  if (APP_BODY.children.length == 2) {
    CALC_BTN.classList.add("hidden")
    RESULT.classList.add("hidden")
  } else {
    CALC_BTN.classList.remove("hidden")
  }
}

function subjectCount() {
  newCount = APP_BODY.childElementCount
  count = newCount - 2
  hideBtn()
}

function clickToAdd() {
  const newList = document.createElement("div")
  newList.classList.add("list")
  newList.innerHTML = innerList
  APP_BODY.appendChild(newList)

  count++
  newList.querySelector(".subj-input").value += count

  newList.querySelector(".a-btn").addEventListener("click", (e) => {
    e.preventDefault
    newList.remove()
    subjectCount()
  })
}

function showResult() {
  const grades = APP_BODY.querySelectorAll(".subj-grade")

  let sum = 0
  let errSum = ""
  getGrade()
  getGradeErr()
  let gpa = 0
  gpa = (sum / grades.length).toFixed(2)

  if (isNaN(gpa)) {
    RESULT.textContent = `Can't compute with ${errSum}`
    removeSuccessColor()
  } else if (gpa > 4) {
    RESULT.textContent = "GPA cant be over 4.00"
    removeSuccessColor()
  } else {
    RESULT.textContent = `Your CGPA: ${gpa}`
    addSuccessColor()
  }
  RESULT.classList.remove("hidden")

  function getGrade() {
    grades.forEach((grade) => {
      if (grade.value == "A+" || grade.value == "a+") return (sum += 4.0)
      if (grade.value == "A" || grade.value == "a") return (sum += 3.75)
      if (grade.value == "A-" || grade.value == "a-") return (sum += 3.5)
      if (grade.value == "B+" || grade.value == "b+") return (sum += 3.25)
      if (grade.value == "B" || grade.value == "b") return (sum += 3.0)
      if (grade.value == "B-" || grade.value == "b-") return (sum += 2.75)
      if (grade.value == "C+" || grade.value == "c+") return (sum += 2.5)
      if (grade.value == "C" || grade.value == "c") return (sum += 2.25)
      if (grade.value == "D" || grade.value == "d") return (sum += 2.0)
      if (grade.value == "F" || grade.value == "f") return (sum += 0.0)
      return (sum += parseFloat(grade.value))
    })
  }

  function getGradeErr() {
    grades.forEach((errGrade) => {
      if (errGrade.value == "") return (errSum = "empty slots")
      if (isNaN(sum)) return (errSum += " - " + errGrade.value)
    })
  }

  function addSuccessColor() {
    RESULT.classList.add("green")
    RESULT.classList.remove("red")
  }

  function removeSuccessColor() {
    RESULT.classList.add("red")
    RESULT.classList.remove("green")
  }

  function showClass() {
    
  }

}
