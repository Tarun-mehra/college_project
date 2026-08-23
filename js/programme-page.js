(() => {
  "use strict";

  const programmes = window.RKAC_PROGRAMMES || [];
  const content = document.querySelector("#programme-content .programme-wrap");
  const escapeHtml = (value = "") => String(value).replace(/[&<>\"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[character]));
  const list = (items = []) => items.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
  const courseUrl = (id) => `programme.html?course=${encodeURIComponent(id)}`;

  const renderDirectory = () => {
    document.title = "Programme Directory | R.K. Arya College";
    content.innerHTML = `
      <div class="section-heading"><div><span class="eyebrow">RK Arya College</span><h2>Choose a programme</h2></div></div>
      <div class="directory" aria-label="Available programmes">
        ${programmes.map((programme) => `<a class="directory-card" href="${courseUrl(programme.id)}"><strong>${escapeHtml(programme.shortName)}</strong><span>${escapeHtml(programme.title)}<br>${escapeHtml(programme.duration)}</span></a>`).join("")}
      </div>`;
  };

  const renderSemesterTable = (programme) => {
    if (!programme.semesters?.length) return `<div class="empty-state">Semester-wise subject details are not listed for this programme.</div>`;
    const tabs = programme.semesters.map((item, index) => `<button type="button" role="tab" aria-selected="${index === 0}" aria-controls="semester-panel-${item.semesterNumber}" data-semester="${item.semesterNumber}">Semester ${item.semesterNumber}</button>`).join("");
    const panels = programme.semesters.map((item, index) => `<div id="semester-panel-${item.semesterNumber}" role="tabpanel" ${index ? "hidden" : ""}>
      <div class="table-scroll"><table><caption>Semester ${item.semesterNumber} subjects</caption><thead><tr><th scope="col">Paper code</th><th scope="col">Subject</th><th scope="col">Marks</th><th scope="col">Theory</th><th scope="col">Practical</th></tr></thead><tbody>${item.subjects.map((entry) => `<tr><td>${escapeHtml(entry.paperCode || "-")}</td><td>${escapeHtml(entry.subjectName)}${entry.note ? `<p class="note">${escapeHtml(entry.note)}</p>` : ""}</td><td>${escapeHtml(entry.marks || "-")}</td><td>${escapeHtml(entry.theory || "-")}</td><td>${escapeHtml(entry.practical || "-")}</td></tr>`).join("")}</tbody></table></div>
    </div>`).join("");
    return `<div class="semester-tabs" role="tablist" aria-label="Semester selection">${tabs}</div><div class="subjects-panel">${panels}</div>`;
  };

  const renderProgramme = (programme) => {
    document.title = `${programme.shortName} | R.K. Arya College`;
    document.querySelector("#breadcrumb-current").textContent = programme.shortName;
    document.querySelector("#page-title").textContent = programme.title;
    document.querySelector("#page-description").textContent = programme.description;
    content.innerHTML = `
      <a class="back-link" href="programme.html">&larr; All programmes</a>
      <p class="course-label">${escapeHtml(programme.courseName || programme.shortName)}</p>
      <dl class="summary" aria-label="Programme information"><div class="info-card"><dt>Duration</dt><dd>${escapeHtml(programme.duration)}</dd></div><div class="info-card"><dt>Eligibility</dt><dd>${escapeHtml(programme.eligibility)}</dd></div><div class="info-card"><dt>Seats available</dt><dd>${escapeHtml(programme.seats)}</dd></div></dl>
      <section aria-labelledby="careers-heading"><div class="section-heading"><h2 id="careers-heading">Career prospects</h2></div><div class="card-grid">${programme.careers.map((career) => `<div class="career-card">${escapeHtml(career)}</div>`).join("")}</div></section>
      <section aria-labelledby="outcomes-heading"><div class="section-heading"><h2 id="outcomes-heading">Course outcomes</h2></div><div class="card-grid">${programme.outcomes.map((outcome) => `<div class="outcome-card">${escapeHtml(outcome)}</div>`).join("")}</div></section>
      ${programme.mainAreas ? `<section aria-labelledby="areas-heading"><div class="section-heading"><h2 id="areas-heading">Main areas</h2></div><div class="card-grid">${programme.mainAreas.map((area) => `<div class="outcome-card">${escapeHtml(area)}</div>`).join("")}</div></section>` : ""}
      ${programme.subjectsOffered || programme.outcomeAreas || programme.compulsorySubjects || programme.electives ? `<section aria-labelledby="subjects-offered-heading"><div class="section-heading"><h2 id="subjects-offered-heading">${programme.subjectsOffered ? "Subjects offered" : "Course outcome areas"}</h2></div><div class="list-block">${programme.subjectsOffered ? `<section><ul>${list(programme.subjectsOffered)}</ul></section>` : `<section><h3>Areas</h3><ul>${list(programme.outcomeAreas)}</ul></section><section><h3>Compulsory subjects</h3><ul>${list(programme.compulsorySubjects)}</ul></section><section><h3>Available elective combinations</h3><p>${escapeHtml(programme.note)}</p><ul>${list(programme.electives)}</ul></section>`}</div></section>` : ""}
      <section aria-labelledby="structure-heading"><div class="section-heading"><div><h2 id="structure-heading">Subject structure</h2><p class="intro">Semester-wise subjects, paper codes and marks as provided in the programme records.</p></div></div>${renderSemesterTable(programme)}</section>`;
    document.querySelectorAll("[data-semester]").forEach((button) => button.addEventListener("click", () => {
      const semesterNumber = button.dataset.semester;
      document.querySelectorAll("[data-semester]").forEach((tab) => tab.setAttribute("aria-selected", String(tab === button)));
      document.querySelectorAll("[role=tabpanel]").forEach((panel) => { panel.hidden = panel.id !== `semester-panel-${semesterNumber}`; });
    }));
  };

  const requestedId = new URLSearchParams(window.location.search).get("course");
  const programme = programmes.find((item) => item.id === requestedId);
  if (programme) renderProgramme(programme); else renderDirectory();
})();
