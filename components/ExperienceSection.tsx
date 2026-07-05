import { experience } from "@/lib/content";
import WorkGallery from "./WorkGallery";

export default function ExperienceSection() {
  return (
    <WorkGallery id="work" number="03" title="Experience" items={experience} />
  );
}
