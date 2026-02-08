import { z } from "zod";

export const TestStepSchema = z.object({
  id: z.string(),
  type: z.enum(['navigate', 'fill', 'click', 'assert']),
  description: z.string(),
  params: z.object({
    selector: z.string().optional(),
    value: z.string().optional(),
    expectedText: z.string().optional(),
  }),
});

export const GhostQASchema = z.object({
  scenarioName: z.string(),
  steps: z.array(TestStepSchema),
  framework: z.enum(['playwright', 'cypress']),
});

export type TestStep = z.infer<typeof TestStepSchema>;
export type GhostQAScenario = z.infer<typeof GhostQASchema>;
