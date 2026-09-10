import { cv, t, ui, period, slugs } from "./data";
import type { BookRecord } from "./components/book";
export function recordFor(path: string): BookRecord | null {
  if (path === "/about")
    return {
      title: t(cv.profile.name),
      text: [
        t(cv.profile.roles[0]),
        t(cv.profile.affiliation.organization),
        t(cv.profile.headline),
        "",
        t(cv.profile.about),
        "",
        ...cv.profile.details.map((d) => `${t(d.label)}: ${t(d.value)}`),
        ...cv.profile.contacts.map((c) => `${t(c.label)}: ${c.value}`),
      ].join("\n"),
      image: cv.profile.photo,
    };
  if (path === "/languages")
    return {
      title: t(cv.skills[3].category),
      text: cv.skills[3].items.map(t).join("\n\n"),
    };
  if (path.startsWith("/projects/")) {
    const p = cv.projects[slugs.indexOf(path.split("/")[2])];
    if (!p) return null;
    return {
      title: t(p.title),
      text: [
        t(p.category),
        period(p),
        t(p.organization),
        "",
        ui("Role", "역할"),
        t(p.role),
        "",
        ui("Approach", "접근 방법"),
        t(p.summary),
        "",
        ui("Outcomes", "결과"),
        ...p.highlights.map(t),
        "",
        ui("Technologies", "기술"),
        p.skills.join(" · "),
      ].join("\n"),
      image: p.image,
    };
  }
  if (path.startsWith("/education/")) {
    const p = cv.education[Number(path.split("/")[2])];
    if (!p) return null;
    return {
      title: t(p.degree),
      text: [
        t(p.school),
        t(p.department),
        period(p),
        p.grade ? `GPA: ${p.grade}` : "",
        "",
        t(p.description),
      ].join("\n"),
    };
  }
  if (path.startsWith("/experience/")) {
    const p = cv.experience[Number(path.split("/")[2])];
    if (!p) return null;
    return {
      title: t(p.title),
      text: [
        t(p.organization),
        period(p),
        t(p.location),
        "",
        t(p.description),
      ].join("\n"),
    };
  }
  if (path.startsWith("/publications/")) {
    const p = cv.publications[Number(path.split("/")[2])];
    if (!p) return null;
    return {
      title: t(p.title),
      text: [
        p.year,
        t(p.type),
        t(p.venue),
        "",
        t(p.authors),
        p.award ? "\n" + t(p.award) : "",
      ].join("\n"),
    };
  }
  if (path.startsWith("/certificates/")) {
    const certificate = cv.certificates.find(item => item.id === path.split("/")[2]);
    if (!certificate) return null;
    return { title: t(certificate.title), text: t(certificate.description), image: certificate.image };
  }
  if (path.startsWith("/awards/")) {
    const p = cv.awards[Number(path.split("/")[2])];
    if (!p) return null;
    return {
      title: t(p.title),
      text: [
        t(p.date),
        t(p.organization),
        t(p.venue),
        t(p.track),
        t(p.certNo),
        "",
        t(p.paper),
        "",
        t(p.description),
      ].join("\n"),
      image: p.image,
    };
  }
  return null;
}
