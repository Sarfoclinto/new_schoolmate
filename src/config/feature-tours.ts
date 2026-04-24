import type { TourStepProps } from "antd";

// const waitForElement = (
//   selector: string,
//   timeout = 3000,
// ): Promise<HTMLElement | undefined> => {
//   return new Promise((resolve) => {
//     const el = document.querySelector(selector);
//     if (el) return resolve(el as HTMLElement);

//     const observer = new MutationObserver(() => {
//       const el = document.querySelector(selector);
//       if (el) {
//         observer.disconnect();
//         resolve(el as HTMLElement);
//       }
//     });

//     observer.observe(document.body, {
//       childList: true,
//       subtree: true,
//     });

//     setTimeout(() => {
//       observer.disconnect();
//       resolve(null);
//     }, timeout);
//   });
// };

export interface FeatureTour {
  id: string;
  featureName: string;
  releaseDate: string;
  version: number;
  priority: number;
  enabled: boolean;
  description: string;
  // steps: Array<{
  //   title: string;
  //   description: string;
  //   target?: TourStepProps["target"];
  //   placement?: TourStepProps["placement"];
  //   sideEffect?: () => void;
  // }>;
  steps: TourStepProps[] & {};
}

/**
 * Feature tours are shown automatically to users on app load
 * if they haven't acknowledged them yet.
 * Higher priority = shown first
 */
export const featureTours: FeatureTour[] = [
  {
    id: "search-command-v1",
    featureName: "Smart Search",
    releaseDate: "2026-04-24",
    version: 1,
    priority: 100,
    enabled: true,
    description: "Quickly search and navigate to any feature in the app",
    steps: [
      {
        title: "🔍 Meet the Smart Search",
        description:
          "Use this search bar to quickly find and navigate to any feature in the app. Press Ctrl+K anytime to open it!",
        // target: "[data-tour='search-input']",
        target: document.querySelector("[data-tour='custom-search-input']"),
        // target:  (async () => await waitForElement("[data-tour='search-input']"))(),
        placement: "bottom",
        nextButtonProps: {
          onClick: () => {
            const event = new KeyboardEvent("keydown", {
              key: "k",
              ctrlKey: true,
            });
            document.dispatchEvent(event);
          },
        },
      },
      {
        title: "📂 Organized by Categories",
        description:
          "Features are organized into logical categories like Students, Staff, Reports, Finance, and more for easy discovery.",
        target: document.querySelector("[data-tour='command-list']"),
        placement: "bottom",
      },
      {
        title: "⌨️ Keyboard Shortcut",
        description:
          "Press Ctrl+K (Cmd+K on Mac) anytime to open the search. You can also click the search box directly.",
        // target: "[data-tour='search-input']",
        placement: "bottom",
      },
    ],
  },
  // Add more feature tours here as you release new features
  // {
  //   id: "new-feature-v1",
  //   featureName: "New Feature Name",
  //   releaseDate: "2026-05-01",
  //   version: 1,
  //   priority: 90,
  //   enabled: true,
  //   description: "Description of the new feature",
  //   steps: [
  //     {
  //       title: "Step 1",
  //       description: "Description",
  //       target: ".target-selector",
  //       placement: "bottom",
  //     },
  //   ],
  // },
];

/**
 * General tours provide a complete walkthrough of the app
 * Users can manually trigger these from the UI
 */
export const generalTours: FeatureTour[] = [
  {
    id: "app-overview",
    featureName: "App Overview",
    releaseDate: "2026-04-24",
    version: 1,
    priority: 1,
    enabled: true,
    description: "A complete tour of the application",
    steps: [
      {
        title: "👋 Welcome to the Dashboard",
        description:
          "This is your main dashboard. Here you can see an overview of all your institution data and quick access to important actions.",
        target: document.querySelector("body"),
        placement: "center",
      },
      {
        title: "🧭 Navigation Sidebar",
        description:
          "Use the left sidebar to navigate between different sections like Students, Staff, Reports, Finance, and more. Press Ctrl+B to collapse/expand it.",
        target: document.querySelector("[data-tour='sidebar']"),
        placement: "right",
      },
      {
        title: "🔍 Smart Search",
        description:
          "Press Ctrl+K anytime to open the smart search. Search for any feature and navigate instantly!",
        target: document.querySelector("[data-tour='custom-search-input']"),
        placement: "bottom",
      },
      {
        title: "👤 User Menu",
        description:
          "Click your profile picture in the top right to access your profile, settings, and logout.",
        target: document.querySelector("[data-tour='user-menu']"),
        placement: "bottom",
      },
    ],
  },
];

/**
 * Combine all tours (for manual tour feature)
 */
export const allTours: FeatureTour[] = [...featureTours, ...generalTours].sort(
  (a, b) => b.priority - a.priority,
);
