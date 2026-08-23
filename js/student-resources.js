import { resourceCatalog } from "./student-resources-data.js";

const programmeSelect = document.querySelector("#programme-select");
const semesterSelect = document.querySelector("#semester-select");
const resourceList = document.querySelector("#resource-list");
const resourceStatus = document.querySelector("#resource-status");

const createOption = (label, value) => {
  const option = document.createElement("option");
  option.value = value;
  option.textContent = label;
  return option;
};

const selectedProgramme = () =>
  resourceCatalog.find(({ id }) => id === programmeSelect.value) ??
  resourceCatalog[0];

const renderSemesters = () => {
  const programme = selectedProgramme();
  semesterSelect.replaceChildren(
    ...programme.semesters.map(({ id, label }) => createOption(label, id)),
  );
  renderResources();
};

const renderResources = () => {
  const programme = selectedProgramme();
  const semester =
    programme.semesters.find(({ id }) => id === semesterSelect.value) ??
    programme.semesters[0];
  const resources = semester?.resources ?? [];

  resourceList.replaceChildren();
  resourceStatus.textContent = resources.length
    ? `${resources.length} resource${resources.length === 1 ? "" : "s"} available`
    : "Resources for this semester will be added soon.";

  resources.forEach((resource) => {
    const article = document.createElement("article");
    article.className = "site-page-card";

    const category = document.createElement("p");
    category.className =
      "mb-2 text-xs font-bold uppercase tracking-widest text-[#c49a4a]";
    category.textContent = `${resource.category} | ${resource.format}`;

    const title = document.createElement("h2");
    title.textContent = resource.title;

    const description = document.createElement("p");
    description.textContent = resource.description;

    const link = document.createElement("a");
    link.href = resource.url;
    link.textContent = resource.download
      ? "Download resource"
      : "Open resource";
    link.target = resource.url.startsWith("http") ? "_blank" : "_self";
    link.rel = link.target === "_blank" ? "noopener noreferrer" : "";

    article.append(category, title, description, link);
    resourceList.append(article);
  });
};

resourceCatalog.forEach(({ id, label }) =>
  programmeSelect.append(createOption(label, id)),
);
programmeSelect.addEventListener("change", renderSemesters);
semesterSelect.addEventListener("change", renderResources);
renderSemesters();
