### VibeTravel: Tech Stack Description

This document outlines the technology stack chosen for the VibeTravel MVP. Each component is selected to accelerate development, ensure scalability, and directly address the functional requirements detailed in the prd.md file.

### Frontend

The frontend is what the user sees and interacts with. It will be built as a modern web application that is fast, responsive, and works well on both desktop and mobile browsers.

- **React:** The core JavaScript library for building the interactive user interface. React will be used to create dynamic components like the multi-step **Travel Plan Wizard** (`F-002`), the **Generated Itinerary** view where users can reorder and delete activities (`F-005`), and the forms for user registration and login (`F-001`).

- **Astro:** The web framework used to build the application. Astro is excellent for creating fast, content-focused websites. It will handle the overall structure and routing of the application, rendering pages that load quickly. It will use React components as interactive "islands" for parts of the app that require user input and dynamic updates, providing a great user experience.

- **Tailwind CSS:** A utility-first CSS framework for styling the application. Tailwind will be used to rapidly design and build a clean, modern, and responsive user interface for all pages and components, from buttons and forms to the layout of the travel plans.

### Backend & Database

The backend handles the application's logic, data storage, and user management.

- **Supabase:** A Backend-as-a-Service (BaaS) platform built on PostgreSQL. Supabase will serve as the entire backend for the MVP, drastically reducing development time. Its key responsibilities include:
  - **User Authentication (`F-001`):** Managing user sign-up and login securely.
  - **Database (`F-006`):** Providing the PostgreSQL database to save and retrieve user-generated travel plans, linking them to specific user accounts.
  - **APIs:** Automatically generating the necessary APIs for the frontend to communicate with the database (e.g., to save a plan or fetch a user's list of saved plans).

### AI Model Communication

This component is responsible for the core value proposition of the application: generating travel itineraries.

- **Openrouter.ai:** An AI model aggregator that provides a single API endpoint to access various large language models. This service will be used to implement the **AI-Powered Itinerary Generation** (`F-003`). The application will send the user's inputs from the wizard (destination, duration, intensity) to Openrouter.ai and receive a structured, geographically-optimized travel plan in return.

### CI/CD & Hosting

This is the infrastructure that automates the deployment process and makes the application available on the internet.

- **GitHub Actions:** The automation tool for Continuous Integration and Continuous Deployment (CI/CD). A GitHub Actions workflow will be configured to automatically build the Astro/React application and deploy it to our hosting provider whenever changes are pushed to the main code repository. This ensures a reliable and efficient release process.

- **DigitalOcean:** The cloud infrastructure provider that will host the VibeTravel web application. A DigitalOcean server (Droplet) will be used to run the application, making it accessible to users worldwide. DigitalOcean provides a flexible and scalable environment that can grow with the application's user base.
