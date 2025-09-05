# Overview

This is a full-stack e-commerce application for "AURA FASHION" - a premium women's kurta collection store. The application provides a modern shopping experience with real-time features, admin management, and WhatsApp-based ordering system. Built with React frontend, Express backend, and PostgreSQL database using Drizzle ORM.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite for build tooling
- **UI Library**: Radix UI components with shadcn/ui design system
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation

## Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Real-time Communication**: WebSocket server for live updates
- **API Design**: RESTful endpoints with real-time broadcasting
- **Data Validation**: Zod schemas shared between client and server
- **Storage**: In-memory storage with interface for easy database migration

## Database Schema
- **Users**: Admin authentication with role-based access
- **Products**: Complete product catalog with images, sizes, pricing, and inventory
- **Orders**: Customer orders with delivery information and status tracking
- **Schema Management**: Drizzle ORM with PostgreSQL dialect

## Real-time Features
- **WebSocket Integration**: Live updates for admin actions and inventory changes
- **Auto-sync**: Real-time synchronization between admin panel and customer view
- **Connection Management**: Automatic reconnection and status indicators

## E-commerce Features
- **Product Management**: Complete CRUD operations for products with image galleries
- **Order Processing**: WhatsApp-based ordering with form validation
- **Admin Dashboard**: Product management, order tracking, and real-time analytics
- **Responsive Design**: Mobile-first approach with adaptive layouts

## Authentication & Authorization
- **Admin System**: Username/password authentication for admin panel access
- **Session Management**: Cookie-based sessions with PostgreSQL session store
- **Role-based Access**: Admin and user role separation

# External Dependencies

## Core Framework Dependencies
- **@tanstack/react-query**: Server state management and caching
- **wouter**: Lightweight routing library for React
- **react-hook-form**: Form handling with validation
- **@hookform/resolvers**: Zod resolver integration for forms

## UI Component Libraries
- **@radix-ui/***: Comprehensive accessible UI components (dialogs, forms, navigation, etc.)
- **lucide-react**: Modern icon library
- **class-variance-authority**: CSS class variant management
- **tailwindcss**: Utility-first CSS framework

## Database & ORM
- **drizzle-orm**: Type-safe ORM for PostgreSQL
- **drizzle-zod**: Schema validation integration
- **@neondatabase/serverless**: PostgreSQL database driver for Neon
- **connect-pg-simple**: PostgreSQL session store for Express

## Real-time Communication
- **ws**: WebSocket library for real-time features

## Validation & Utilities
- **zod**: Schema validation library
- **date-fns**: Date manipulation utilities
- **clsx** & **tailwind-merge**: CSS class management utilities

## Development Tools
- **vite**: Fast build tool and dev server
- **typescript**: Static type checking
- **tsx**: TypeScript execution for Node.js
- **esbuild**: JavaScript bundler for production builds

## External Services Integration
- **WhatsApp Business API**: Order processing through WhatsApp
- **Image Hosting**: External image URLs for product galleries
- **Email Integration**: Contact form and order notifications