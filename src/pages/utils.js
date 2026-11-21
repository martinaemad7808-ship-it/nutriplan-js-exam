/** Returns the <section> with this id inside #main-content, creating it if needed */
export function getOrCreateSection(id, className) {
  let section = document.getElementById(id);
  if (!section) {
    section = document.createElement("section");
    section.id = id;
    section.className = className;
    document.getElementById("main-content").appendChild(section);
  }
  section.style.display = "";
  return section;
}
