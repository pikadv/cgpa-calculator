# NU CGPA Calculator

A lightweight, mobile-friendly GPA and CGPA calculator for students of National University Bangladesh.

**Live site:** https://pikadv.app/cgpa-calculator

## Features

- Calculate GPA or CGPA using course credits and grade points.
- Add, edit, or remove courses manually.
- Choose a degree type, department, academic year, and syllabus version.
- Load course lists where catalogue data is available, and enter courses manually where it is not.
- View the NU grading scale and the weighted-average formula.
- Use the calculator on mobile or desktop.

## How to use

1. Select a degree type. For catalogue-backed programmes, choose an available department, academic year, and syllabus version.
2. Review loaded courses, or add subjects manually when a course list is unavailable.
3. Enter each course's credit and grade.
4. Select **Calculate GPA / CGPA** to view the result.

The calculator defaults newly added courses to **4 credits**. Always check and use the credit value printed on your own syllabus or marksheet.

## Calculation

The calculator estimates the weighted average:

\[
\text{GPA/CGPA} = \frac{\sum(\text{grade point} \times \text{course credit})}{\sum(\text{graded course credits})}
\]

Courses without a selected grade are ignored. An F contributes zero grade points for its entered credits.

## Important note

This is an unofficial estimate, not an official result from National University. Course lists and academic rules may differ by programme and syllabus year, including rules for failed, improved, non-credit, practical, and viva courses. Verify your course credits and calculation rules against your own syllabus and official university guidance.

## Built with

HTML, CSS, and JavaScript. The static site is deployed to GitHub Pages using GitHub Actions.
