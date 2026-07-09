import { projects } from "@/lib/content";
import WorkGallery from "./WorkGallery";

export default function ProjectsSection() {
  return (
    <WorkGallery id="projects" number="04" title="Projects" items={projects} />
  );
}
