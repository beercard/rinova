# Admin Routes Documentation

## Overview
This document outlines the routing structure for the Rinova administration panel.

## Routes Configuration

### 1. Admin Login (Entry Point)
- **Path:** `/admin/login`
- **Component:** `AdminLogin.jsx`
- **Access:** Public
- **Description:** Entry point for administrators. Contains login form using email/password authentication.

### 2. Admin Dashboard
- **Path:** `/admin`
- **Component:** `AdminDashboard.jsx`
- **Access:** Protected (Requires Authentication)
- **Description:** Overview of system statistics (total properties, contacts).

### 3. Property Management
- **Path:** `/admin/propiedades`
- **Component:** `AdminProperties.jsx`
- **Access:** Protected (Requires Authentication)
- **Description:** CRUD operations for properties. Allows adding, editing, and deleting real estate listings.

### 4. Contact Management
- **Path:** `/admin/contactos`
- **Component:** `AdminContacts.jsx`
- **Access:** Protected (Requires Authentication)
- **Description:** List of submitted contact forms from potential clients.

### 5. Admin Settings
- **Path:** `/admin/configuracion`
- **Component:** `AdminSettings.jsx`
- **Access:** Protected (Requires Authentication)
- **Description:** Configuration/settings page for administrators.

## Security
All protected routes are wrapped in the `ProtectedRoute` component in `App.jsx`, which verifies the authentication state via `AuthContext`. Unauthenticated users attempting to access protected routes are redirected to `/admin/login`.
