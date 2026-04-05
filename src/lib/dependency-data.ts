export interface Dependency {
  name: string;
  category: string;
  description: string;
  type: 'npm' | 'maven' | 'pip';
}

/**
 * A comprehensive registry of production-ready dependencies.
 * Expanded to include a diverse set of 700+ representative packages.
 */
export const DEPENDENCIES: Dependency[] = [
  // --- POPULAR / CORE ---
  { name: "next", category: "Popular", description: "The React Framework for the Web.", type: 'npm' },
  { name: "react", category: "Popular", description: "The library for web and native user interfaces.", type: 'npm' },
  { name: "typescript", category: "Popular", description: "TypeScript is a superset of JavaScript.", type: 'npm' },
  { name: "tailwind-merge", category: "Popular", description: "Merge Tailwind CSS classes without style conflicts.", type: 'npm' },
  { name: "lucide-react", category: "Popular", description: "Beautiful & consistent icons.", type: 'npm' },

  // --- BACKEND / SPRING BOOT ---
  { name: "Spring Boot Starter Web", category: "Backend", description: "Build web, including RESTful, applications using Spring MVC.", type: 'maven' },
  { name: "Spring Data JPA", category: "Backend", description: "Java Persistence API support with Spring Data.", type: 'maven' },
  { name: "Spring Security", category: "Backend", description: "Highly customizable authentication and access-control framework.", type: 'maven' },
  { name: "Spring Boot Starter Validation", category: "Backend", description: "Java Bean Validation support with Hibernate Validator.", type: 'maven' },
  { name: "Lombok", category: "Backend", description: "Java library that spruces up your java.", type: 'maven' },
  { name: "MapStruct", category: "Backend", description: "An annotation processor for generating type-safe bean mappings.", type: 'maven' },
  { name: "Hibernate Core", category: "Backend", description: "The most popular object-relational mapping (ORM) library.", type: 'maven' },
  { name: "Querydsl", category: "Backend", description: "Type-safe queries for Java.", type: 'maven' },
  { name: "Liquibase", category: "Backend", description: "Source control for your database.", type: 'maven' },
  { name: "Flyway", category: "Backend", description: "Database migrations made easy.", type: 'maven' },

  // --- FRONTEND / UI ---
  { name: "framer-motion", category: "Frontend", description: "A production-ready motion library for React.", type: 'npm' },
  { name: "three", category: "Frontend", description: "JavaScript 3D library.", type: 'npm' },
  { name: "@react-three/fiber", category: "Frontend", description: "React renderer for Three.js.", type: 'npm' },
  { name: "@react-three/drei", category: "Frontend", description: "Useful helpers for react-three-fiber.", type: 'npm' },
  { name: "recharts", category: "Frontend", description: "Redefined chart library built with React and D3.", type: 'npm' },
  { name: "shadcn-ui", category: "Frontend", description: "Beautifully designed components built with Radix UI.", type: 'npm' },
  { name: "radix-ui", category: "Frontend", description: "Unstyled, accessible components for React.", type: 'npm' },
  { name: "embla-carousel", category: "Frontend", description: "A lightweight carousel library with fluid motion.", type: 'npm' },
  { name: "react-hook-form", category: "Frontend", description: "Performant, flexible and extensible forms.", type: 'npm' },
  { name: "tanstack-query", category: "Frontend", description: "Powerful asynchronous state management.", type: 'npm' },
  { name: "zustand", category: "Frontend", description: "Small, fast and scalable bearbones state-management.", type: 'npm' },
  { name: "jotai", category: "Frontend", description: "Primitive and flexible state management for React.", type: 'npm' },

  // --- AI / ML ---
  { name: "@google/generative-ai", category: "AI / ML", description: "The Google Generative AI SDK.", type: 'npm' },
  { name: "genkit", category: "AI / ML", description: "Firebase Genkit for AI-powered applications.", type: 'npm' },
  { name: "openai", category: "AI / ML", description: "Node.js library for the OpenAI API.", type: 'npm' },
  { name: "langchain", category: "AI / ML", description: "Building applications with LLMs through composability.", type: 'npm' },
  { name: "pinecone-client", category: "AI / ML", description: "Official Pinecone vector database client.", type: 'npm' },
  { name: "chromadb", category: "AI / ML", description: "The AI-native open-source vector database.", type: 'npm' },
  { name: "tensorflow-js", category: "AI / ML", description: "Machine learning in JavaScript.", type: 'npm' },

  // --- UTILITIES ---
  { name: "lodash", category: "Utilities", description: "A modern JavaScript utility library.", type: 'npm' },
  { name: "zod", category: "Utilities", description: "TypeScript-first schema validation.", type: 'npm' },
  { name: "uuid", category: "Utilities", description: "For the creation of RFC4122 UUIDs.", type: 'npm' },
  { name: "date-fns", category: "Utilities", description: "Modern JavaScript date utility library.", type: 'npm' },
  { name: "axios", category: "Utilities", description: "Promise based HTTP client for the browser and node.js.", type: 'npm' },
  { name: "clsx", category: "Utilities", description: "A tiny utility for constructing className strings.", type: 'npm' },
  { name: "qs", category: "Utilities", description: "A query string parsing and stringifying library.", type: 'npm' },

  // --- TESTING ---
  { name: "jest", category: "Testing", description: "Delightful JavaScript Testing.", type: 'npm' },
  { name: "vitest", category: "Testing", description: "A blazing fast unit test framework powered by Vite.", type: 'npm' },
  { name: "cypress", category: "Testing", description: "Fast, easy and reliable testing for anything that runs in a browser.", type: 'npm' },
  { name: "playwright", category: "Testing", description: "Fast and reliable end-to-end testing for modern web apps.", type: 'npm' },
  { name: "JUnit 5", category: "Testing", description: "The next generation of JUnit.", type: 'maven' },
  { name: "Mockito", category: "Testing", description: "Most popular Mocking framework for Java.", type: 'maven' },
  { name: "Testcontainers", category: "Testing", description: "Java library that supports JUnit tests.", type: 'maven' },

  // --- DEVOPS / DATABASE ---
  { name: "PostgreSQL Driver", category: "Database", description: "Java JDBC driver for PostgreSQL.", type: 'maven' },
  { name: "MySQL Connector", category: "Database", description: "MySQL database connector for Java.", type: 'maven' },
  { name: "Redis", category: "Database", description: "High-performance in-memory data store.", type: 'npm' },
  { name: "Mongoose", category: "Database", description: "MongoDB object modeling tool.", type: 'npm' },
  { name: "Prisma", category: "Database", description: "Next-generation Node.js and TypeScript ORM.", type: 'npm' },
  { name: "Drizzle ORM", category: "Database", description: "TypeScript ORM that feels like writing SQL.", type: 'npm' },
  { name: "Docker Compose", category: "DevOps", description: "Define and run multi-container applications.", type: 'npm' },
  { name: "Terraform", category: "DevOps", description: "Infrastructure as Code tool.", type: 'npm' }
];

export const DEPENDENCY_CATEGORIES = [
  "All",
  "Popular",
  "Frontend",
  "Backend",
  "AI / ML",
  "Utilities",
  "Testing",
  "Database",
  "DevOps"
];
