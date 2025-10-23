# Product Requirements Document (PRD) - VibeTravel

## 1. Product Overview

VibeTravels is a web application designed to simplify travel planning for solo and couple travelers. By leveraging AI, the platform transforms high-level travel ideas and preferences into concrete, geographically optimized daily itineraries. The Minimum Viable Product (MVP) focuses on generating coherent travel plans for short trips (1-5 days) across 10 popular European cities, aiming to minimize travel time between suggested activities. The core value proposition is to remove the difficulty and time-commitment of planning a logically sequenced and enjoyable trip.

## 2. User Problem

Planning a comprehensive, amusing, and interesting trip is a difficult and time-consuming process. Travelers often struggle to create itineraries that are geographically efficient, leading to wasted time and energy moving between locations. They may also be unaware of the best sequence of activities to maximize their experience. VibeTravels addresses this by using AI to generate well-thought-out travel plans that are logically structured, saving users time and effort while providing a high-quality travel experience.

## 3. Functional Requirements

The VibeTravels MVP will include the following core functionalities:

- F-001: User Account Management: Users must be able to sign up for a new account using an email and password and log in to access the application.
- F-002: Travel Plan Wizard: A step-by-step wizard to capture initial travel requirements, including:
  - Destination City (selectable from a predefined list of 10).
  - Trip Duration (1 to 5 days).
  - Trip Intensity ("full day" or "half day").
- F-003: AI-Powered Itinerary Generation: The system's core AI will generate a daily travel plan based on the wizard's inputs.
  - The itinerary will be geographically optimized to minimize travel distance between activities, using straight-line distance for MVP calculations.
  - "Full day" plans will contain 4-5 activities.
  - "Half day" plans will contain 2-3 activities.
- F-004: Plan Content: Each activity within the generated itinerary will include:
  - The name of the location or activity.
  - A direct hyperlink to the location on Google Maps.
  - A persistent disclaimer will be visible on the plan page, advising users to independently verify details such as opening hours.
- F-005: Itinerary Editing: Users can modify the generated plan with simple controls:
  - "Move Up" and "Move Down" buttons to reorder activities within a day.
  - A "Delete" button to remove an unwanted activity.
- F-006: Plan Saving: Logged-in users must be able to save a generated and edited plan to their account for future access.
- F-007: User Feedback Mechanism: A simple "Was this plan helpful? Yes/No" feature will be displayed with each plan to gather user satisfaction data.
- F-008: Basic Error Handling: A user-friendly error message will be displayed if the AI fails to generate a plan from the provided inputs.

## 4. Product Boundaries

### In-Scope

- Web application targeting desktop and mobile browsers.
- User authentication via a custom email and password system.
- Support for 10 pre-defined European cities.
- Trips lasting from 1 to 5 days.
- Focus on solo and couple travelers.
- Geographically logical routing based on straight-line distance.

### Out-of-Scope for MVP

- Monetization: All features included in MVP will be free.
- Password Recovery: "Forgot password" functionality is not included.
- Advanced Editing: Drag-and-drop editing interfaces will not be implemented.
- Social Logins: Third-party authentication (e.g., Google, Facebook) is not included.
- Expanded Audience: Plans are not optimized for families, large groups or disabled people.
- Real-time Data: The system will not use real-time data like traffic, transit schedules, or live opening hours.
- User Profile Management: Users cannot edit their profile information after registration.
- Plan Sharing: Users cannot share their saved plans with others.

## 5. User Stories

### Authentication

- ID: US-001
- Title: New User Registration
- Description: As a new user, I want to create an account using my email and a password so that I can save and manage my travel plans.
- Acceptance Criteria:
  - 1. The registration form must require a valid email format and a password.
  - 2. Upon successful submission, a new user account is created in the system.
  - 3. The user is automatically logged in and redirected to the main application page.
  - 4. An error message is displayed if the email is already in use.

- ID: US-002
- Title: User Login
- Description: As a returning user, I want to log in to my account so I can access my saved plans and create new ones.
- Acceptance Criteria:
  - 1. The login form requires an email and password.
  - 2. Upon successful authentication, the user is granted access to the application.
  - 3. An error message is displayed for invalid credentials.

### Plan Creation and Management

- ID: US-003
- Title: Initiate Travel Plan Creation
- Description: As a logged-in user, I want to start the process of creating a new travel plan.
- Acceptance Criteria:
  - 1. A "Create New Plan" button or link is clearly visible on the main page.
  - 2. Clicking the button initiates the Travel Plan Wizard.

- ID: US-004
- Title: Use Travel Wizard for Input
- Description: As a user, I want to use a simple wizard to provide my basic travel requirements and add a free text notes so that the AI can generate a relevant plan.
- Acceptance Criteria:
  - 1. The wizard first prompts for a Destination City from a dropdown list of 10 options.
  - 2. The wizard then prompts for the number of days (a carousel with numbers from 1 to 5).
  - 3. The wizard then prompts for Trip Intensity ("full day" or "half day") via two buttons next to each other (horizontally).
  - 4. User is prompted to fill in details not covered by wizard (in a free text field).
  - 4. A "Generate" button is present to submit the inputs.

- ID: US-005
- Title: View Generated Itinerary
- Description: As a user, I want to see the generated travel plan clearly displayed after submitting my preferences.
- Acceptance Criteria:
  - 1. The plan is displayed day-by-day.
  - 2. Each day lists the suggested activities in a sequential order.
  - 3. Each activity includes its name and a clickable link to Google Maps.
  - 4. A disclaimer about verifying information is visible on the page.

- ID: US-006
- Title: Reorder an Activity
- Description: As a user, after clicking edit button, I want to be able to move an activity up or down in the daily itinerary to customize the plan to my liking.
- Acceptance Criteria:
  - 1. Each activity item has a "Move Up" and "Move Down" button.
  - 2. Clicking "Move Up" swaps the activity with the one directly above it.
  - 3. Clicking "Move Down" swaps the activity with the one directly below it.
  - 4. The "Move Up" button is disabled for the first activity, and "Move Down" is disabled for the last.

- ID: US-007
- Title: Delete an Activity
- Description: As a user, after clicking edit button, I want to remove an activity from the itinerary that I am not interested in.
- Acceptance Criteria:
  - 1. Each activity item has a "Delete" button.
  - 2. Clicking the "Delete" button permanently removes the activity from the displayed plan.

- ID: US-008
- Title: Save a Travel Plan
- Description: As a user with a finalized plan, I want to save it to my account so I can access it later.
- Acceptance Criteria:
  - 1. A "Save Plan" button is available on the itinerary page.
  - 2. Clicking the button saves the current state of the plan (including all reorders and deletions) to the user's account.
  - 3. A confirmation message (e.g., "Plan saved!") is displayed to the user.

- ID: US-009
- Title: Access Saved Plans
- Description: As a logged-in user, I want to be able to view a list of my previously saved plans.
- Acceptance Criteria:
  - 1. There is a navigation link or section (e.g., "My Plans") to view saved plans.
  - 2. Clicking on a saved plan from the list opens it for viewing.

### User Feedback and Error Handling

- ID: US-010
- Title: Provide Plan Feedback
- Description: As a user, I want to give simple feedback on the quality of the generated plan.
- Acceptance Criteria:
  - 1. A question "Was this plan helpful?" is displayed with "Yes" and "No" buttons.
  - 2. A user can click either "Yes" or "No" once per generated plan.
  - 3. The response is recorded in the system for analysis.
  - 4. Quesion "Was this plan helpful?" does not appear in plans that already have feedback from user.

- ID: US-011
- Title: Handle AI Generation Failure
- Description: As a user, I want to see a clear message if the system cannot generate a plan based on my input.
- Acceptance Criteria:
  - 1. If the AI backend fails to return a valid plan, a user-friendly error message is displayed instead of a blank page or technical error.
  - 2. The message should inform the user that a plan could not be created and suggest trying again.

## 6. Success Metrics

The success of the VibeTravels MVP will be measured by its ability to produce useful and coherent travel plans that users find valuable enough to save.

- Primary Success Criterion: The usefulness and coherence of the generated travel plan.
- Primary Key Performance Indicator (KPI): Plan Adoption Rate.
  - Measurement: This will be calculated as (Total Number of Saved Plans) / (Total Number of Generated Plans). User accounts are mandatory to enable this tracking.
- Secondary Key Performance Indicator (KPI): User Satisfaction Rate.
  - Measurement: This will be tracked via the "Was this plan helpful? Yes/No" feedback feature, measuring the ratio of "Yes" to "No" responses.
