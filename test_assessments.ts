import { getAssessmentCatalogPageData } from "./src/api/assessment.api";

async function run() {
  try {
    const data = await getAssessmentCatalogPageData();
    console.log(JSON.stringify(data.assessments[0], null, 2));
  } catch (err) {
    console.error(err);
  }
}
run();
