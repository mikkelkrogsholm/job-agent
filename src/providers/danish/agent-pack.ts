import { AGENT_GUIDES, AGENT_PROMPTS } from "../../../web/generated/agent-pack.ts";
import { canonicalUrl } from "../../../web/pages.ts";

export const JOBSEEKER_GOALS = [
  "unsure",
  "create_profile",
  "find_jobs",
  "monitor_jobs",
  "compare_jobs",
  "tailor_cv",
  "write_application",
  "quality_check",
  "prepare_interview",
  "follow_up",
] as const;

export type JobseekerGoal = typeof JOBSEEKER_GOALS[number];

const goalSelection: Record<JobseekerGoal, { guideId: string; promptId: string }> = {
  unsure: { guideId: "forloeb-find-retning", promptId: "find_jobretning" },
  create_profile: { guideId: "forloeb-jobprofil", promptId: "lav_jobprofil" },
  find_jobs: { guideId: "forloeb-find-job", promptId: "find_aktuelle_job" },
  monitor_jobs: { guideId: "forloeb-hold-oeje", promptId: "hold_oeje_med_job" },
  compare_jobs: { guideId: "forloeb-vurder-job", promptId: "sammenlign_job" },
  tailor_cv: { guideId: "cv", promptId: "tilpas_cv" },
  write_application: { guideId: "ansoegning", promptId: "skriv_ansoegning" },
  quality_check: { guideId: "kvalitetstjek-og-send", promptId: "kvalitetstjek_ansogning" },
  prepare_interview: { guideId: "jobsamtale", promptId: "oev_jobsamtale" },
  follow_up: { guideId: "foelg-op", promptId: "foelg_op" },
};

const journeyGuideIds = [
  "forloeb-find-retning",
  "forloeb-jobprofil",
  "forloeb-find-job",
  "forloeb-hold-oeje",
  "forloeb-vurder-job",
  "uopfordret",
  "cv",
  "ansoegning",
  "kvalitetstjek-og-send",
  "foelg-op",
  "jobsamtale",
] as const;

export const JOBAGENTEN_BOUNDARIES = [
  "Brug kun oplysninger om jobsøgeren, som personen selv har givet eller godkendt.",
  "Kontrollér job, frister og ansøgningsveje i den originale annonce.",
  "Jobagenten må ikke logge ind, ændre profiler, kontakte arbejdsgivere eller sende ansøgninger.",
  "Jobsøgeren vælger retning, godkender materiale og sender altid selv.",
] as const;

export function getAgentGuide(guideId: string) {
  return AGENT_GUIDES.find((guide) => guide.id === guideId);
}

export function createJourneyStart(goal: JobseekerGoal = "unsure") {
  const selection = goalSelection[goal];
  const guide = getAgentGuide(selection.guideId);
  const prompt = AGENT_PROMPTS.find((candidate) => candidate.id === selection.promptId);
  if (!guide || !prompt) throw new Error(`Agentpakken mangler indhold til ${goal}`);

  return {
    source: "Jobagenten",
    goal,
    mission: "Hjælp en dansk jobsøgende med ét overskueligt næste skridt ad gangen fra afklaring til en ansøgning, personen selv sender.",
    boundaries: JOBAGENTEN_BOUNDARIES,
    nextStep: {
      guideId: guide.id,
      title: guide.title,
      summary: guide.summary,
      canonicalUrl: canonicalUrl(guide.route),
      markdownUrl: canonicalUrl(guide.markdownRoute),
      starterMessage: prompt.text,
    },
    journey: journeyGuideIds.map((guideId) => {
      const item = getAgentGuide(guideId);
      if (!item) throw new Error(`Agentpakken mangler guiden ${guideId}`);
      return { guideId: item.id, title: item.title, summary: item.summary, canonicalUrl: canonicalUrl(item.route) };
    }),
    availableTools: ["start_jobseeker_journey", "get_jobseeker_guide", "search_danish_jobs", "get_danish_job_details"],
  };
}

export function guidePayload(guideId: string) {
  const guide = getAgentGuide(guideId);
  if (!guide) return undefined;
  return {
    id: guide.id,
    title: guide.title,
    summary: guide.summary,
    stage: guide.stage,
    canonicalUrl: canonicalUrl(guide.route),
    markdownUrl: canonicalUrl(guide.markdownRoute),
    optionalCapabilities: guide.optionalCapabilities,
    humanConfirmations: guide.humanConfirmations,
    readOnlyBoundary: true,
    contentMarkdown: guide.contentMarkdown,
    characterCount: guide.contentMarkdown.length,
  };
}

export function renderStartResource(): string {
  const start = createJourneyStart();
  return `# Start med Jobagenten\n\n${start.mission}\n\n## Faste grænser\n\n${start.boundaries.map((item) => `- ${item}`).join("\n")}\n\n## Første skridt\n\n${start.nextStep.starterMessage}\n\n## Hele forløbet\n\n${start.journey.map((item, index) => `${index + 1}. [${item.title}](${item.canonicalUrl}) — ${item.summary}`).join("\n")}\n`;
}

export function renderPromptResource(): string {
  return `# Beskeder til jobsøgning\n\n${AGENT_PROMPTS.map((prompt) => `## ${prompt.title}\n\n${prompt.text}`).join("\n\n")}\n`;
}

export { AGENT_GUIDES, AGENT_PROMPTS };
