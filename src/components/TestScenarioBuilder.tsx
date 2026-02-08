import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { TestStep, TestStepSchema, GhostQASchema } from '../lib/tambo-registry';
import { TestStepCard } from './TestStepCard';
import { Sparkles, Code, Copy, CheckCheck } from 'lucide-react';

export function TestScenarioBuilder() {
  const [prompt, setPrompt] = useState('');
  const [scenarioName, setScenarioName] = useState('Untitled Test Scenario');
  const [framework, setFramework] = useState<'playwright' | 'cypress'>('playwright');
  const [steps, setSteps] = useState<TestStep[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const generateStepsFromPrompt = (userPrompt: string) => {
    setIsGenerating(true);

    setTimeout(() => {
      const mockSteps: TestStep[] = [];
      const lowercasePrompt = userPrompt.toLowerCase();

      if (lowercasePrompt.includes('login')) {
        mockSteps.push(
          {
            id: `step-${Date.now()}-1`,
            type: 'navigate',
            description: 'Navigate to login page',
            params: {
              value: '/login',
            },
          },
          {
            id: `step-${Date.now()}-2`,
            type: 'fill',
            description: 'Fill in email address',
            params: {
              selector: 'input[type="email"]',
              value: 'user@example.com',
            },
          },
          {
            id: `step-${Date.now()}-3`,
            type: 'fill',
            description: 'Fill in password',
            params: {
              selector: 'input[type="password"]',
              value: 'password123',
            },
          },
          {
            id: `step-${Date.now()}-4`,
            type: 'click',
            description: 'Click login button',
            params: {
              selector: 'button[type="submit"]',
            },
          }
        );
      }

      if (lowercasePrompt.includes('dashboard')) {
        mockSteps.push({
          id: `step-${Date.now()}-5`,
          type: 'assert',
          description: 'Verify dashboard is visible',
          params: {
            selector: '.dashboard',
            expectedText: 'Welcome',
          },
        });
      }

      if (mockSteps.length === 0) {
        mockSteps.push(
          {
            id: `step-${Date.now()}-1`,
            type: 'navigate',
            description: 'Navigate to page',
            params: {
              value: '/',
            },
          },
          {
            id: `step-${Date.now()}-2`,
            type: 'click',
            description: 'Click element',
            params: {
              selector: 'button',
            },
          },
          {
            id: `step-${Date.now()}-3`,
            type: 'assert',
            description: 'Verify result',
            params: {
              selector: '.result',
              expectedText: 'Success',
            },
          }
        );
      }

      try {
        mockSteps.forEach(step => TestStepSchema.parse(step));
        setSteps(mockSteps);
        setScenarioName(userPrompt || 'Generated Test Scenario');
      } catch (error) {
        console.error('Validation error:', error);
      }

      setIsGenerating(false);
      setPrompt('');
    }, 800);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setSteps((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const updateStep = (id: string, updates: Partial<TestStep>) => {
    setSteps((prev) =>
      prev.map((step) =>
        step.id === id ? { ...step, ...updates } : step
      )
    );
  };

  const deleteStep = (id: string) => {
    setSteps((prev) => prev.filter((step) => step.id !== id));
  };

  const exportToPlaywright = () => {
    let code = `import { test, expect } from '@playwright/test';\n\n`;
    code += `test('${scenarioName}', async ({ page }) => {\n`;

    steps.forEach((step) => {
      switch (step.type) {
        case 'navigate':
          code += `  await page.goto('${step.params.value || '/'}');\n`;
          break;
        case 'fill':
          code += `  await page.fill('${step.params.selector}', '${step.params.value}');\n`;
          break;
        case 'click':
          code += `  await page.click('${step.params.selector}');\n`;
          break;
        case 'assert':
          code += `  await expect(page.locator('${step.params.selector}')).toContainText('${step.params.expectedText}');\n`;
          break;
      }
    });

    code += `});\n`;

    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const exportToCypress = () => {
    let code = `describe('${scenarioName}', () => {\n`;
    code += `  it('should complete the test scenario', () => {\n`;

    steps.forEach((step) => {
      switch (step.type) {
        case 'navigate':
          code += `    cy.visit('${step.params.value || '/'}');\n`;
          break;
        case 'fill':
          code += `    cy.get('${step.params.selector}').type('${step.params.value}');\n`;
          break;
        case 'click':
          code += `    cy.get('${step.params.selector}').click();\n`;
          break;
        case 'assert':
          code += `    cy.get('${step.params.selector}').should('contain', '${step.params.expectedText}');\n`;
          break;
      }
    });

    code += `  });\n`;
    code += `});\n`;

    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExport = () => {
    if (framework === 'playwright') {
      exportToPlaywright();
    } else {
      exportToCypress();
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <header className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <Sparkles className="w-8 h-8 text-purple-400" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Ghost QA
            </h1>
          </div>
          <p className="text-slate-400 text-lg">
            Generative UI for Quality Assurance - Describe your test, visualize the steps
          </p>
        </header>

        <div className="bg-slate-900 rounded-xl p-6 mb-8 border border-slate-800 shadow-xl">
          <label className="block text-sm font-medium text-purple-300 mb-3">
            Describe your test scenario
          </label>
          <div className="relative">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && prompt.trim()) {
                  generateStepsFromPrompt(prompt);
                }
              }}
              placeholder="e.g., Login and check dashboard"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              disabled={isGenerating}
            />
            <button
              onClick={() => generateStepsFromPrompt(prompt)}
              disabled={isGenerating || !prompt.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate
                </>
              )}
            </button>
          </div>
        </div>

        {steps.length > 0 && (
          <>
            <div className="flex items-center justify-between mb-6">
              <div className="flex-1">
                <input
                  type="text"
                  value={scenarioName}
                  onChange={(e) => setScenarioName(e.target.value)}
                  className="text-2xl font-semibold bg-transparent border-b-2 border-transparent hover:border-slate-700 focus:border-purple-500 focus:outline-none transition-colors px-2 py-1"
                />
              </div>
              <div className="flex items-center gap-3">
                <select
                  value={framework}
                  onChange={(e) => setFramework(e.target.value as 'playwright' | 'cypress')}
                  className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="playwright">Playwright</option>
                  <option value="cypress">Cypress</option>
                </select>
                <button
                  onClick={handleExport}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                >
                  {copied ? (
                    <>
                      <CheckCheck className="w-4 h-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Code className="w-4 h-4" />
                      Export Code
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="relative">
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-500 via-purple-600 to-pink-500" />

              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={steps.map((step) => step.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-4">
                    {steps.map((step, index) => (
                      <TestStepCard
                        key={step.id}
                        step={step}
                        index={index}
                        onUpdate={updateStep}
                        onDelete={deleteStep}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </div>
          </>
        )}

        {steps.length === 0 && !isGenerating && (
          <div className="text-center py-16 text-slate-500">
            <Sparkles className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg">Start by describing your test scenario above</p>
          </div>
        )}
      </div>
    </div>
  );
}
